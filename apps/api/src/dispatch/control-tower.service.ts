import crypto from 'node:crypto';
import type {
  Assignment,
  AssignmentDecision,
  ControlTowerAlert,
  ControlTowerIntelligenceView,
  ControlTowerRole,
  DispatchEvent,
  DispatchRecommendation,
  DriverLifecycleState,
  DriverSession,
  DriverVisibilityView,
  OperationalRiskSnapshot,
  RealtimeOperationalMetrics,
  RideDispatchRecord,
} from './control-tower.types.js';

const STATE_TRANSITIONS: Record<DriverLifecycleState, DriverLifecycleState[]> = {
  offline: ['available'],
  available: ['assigned', 'offline'],
  assigned: ['en_route', 'available', 'offline'],
  en_route: ['pickup', 'available', 'offline'],
  pickup: ['in_progress', 'available', 'offline'],
  in_progress: ['cooldown', 'offline'],
  cooldown: ['available', 'offline'],
};

const ACK_TIMEOUT_MS = 30_000;
const HEARTBEAT_STALE_MS = 45_000;
const MAX_ACTIVE_RIDES_PER_DRIVER = 1;

export class ControlTowerService {
  private readonly rides = new Map<string, RideDispatchRecord>();
  private readonly driverSessions = new Map<string, DriverSession>();
  private duplicateEventBlockedCount = 0;

  registerDriverSession(driverId: string, roles: ControlTowerRole[] = ['driver']) { /* unchanged behavior */
    const now = new Date().toISOString();
    const session: DriverSession = { driverId, state: 'offline', available: false, lastHeartbeatAt: now, stale: false, roles };
    this.driverSessions.set(driverId, session);
    return session;
  }
  heartbeat(driverId: string) { const s = this.getSessionOrThrow(driverId); s.lastHeartbeatAt = new Date().toISOString(); s.stale = false; return s; }

  updateDriverState(driverId: string, nextState: DriverLifecycleState, actor = 'system') {
    const session = this.getSessionOrThrow(driverId);
    if (!STATE_TRANSITIONS[session.state].includes(nextState)) throw new Error(`invalid_transition:${session.state}->${nextState}`);
    session.state = nextState; session.available = nextState === 'available';
    this.emitRideAgnosticEvent('driver_state_changed', actor, driverId, { state: nextState, available: session.available });
    return session;
  }

  createRideRecord(rideId: string) {
    if (this.rides.has(rideId)) return this.rides.get(rideId)!;
    const record: RideDispatchRecord = {
      rideId, lifecycle: 'open', slaRisk: false, incidentTags: [], timeline: [], assignmentAudit: [], riskLevel: 'low',
      pickupRiskScore: 0.1, etaBreachProbability: 0.1, airportDelayRisk: 0.1, escalationSuggested: false,
    };
    this.rides.set(rideId, record); return record;
  }

  assignDriver(rideId: string, driverId: string, actor = 'dispatcher') {
    const ride = this.ensureMutableRide(rideId); const session = this.getSessionOrThrow(driverId);
    if (!session.available || session.state !== 'available') throw new Error('driver_unavailable');
    if (session.activeRideId) throw new Error('assignment_conflict_detected');
    if (ride.assignedDriverId === driverId && ride.assignmentAudit.some((a) => a.ackStatus === 'pending')) { this.duplicateEventBlockedCount += 1; throw new Error('duplicate_assignment_prevented'); }
    const assignment: Assignment = { assignmentId: crypto.randomUUID(), rideId, driverId, assignedAt: new Date().toISOString(), ackDeadlineAt: new Date(Date.now() + ACK_TIMEOUT_MS).toISOString(), ackStatus: 'pending' };
    if (ride.assignedDriverId && ride.assignedDriverId !== driverId) this.logRideEvent(ride, 'assignment_reassigned', actor, driverId, { previousDriverId: ride.assignedDriverId, reason: 'operational_reassignment' });
    ride.assignedDriverId = driverId; ride.assignmentAudit.push(assignment); session.state = 'assigned'; session.available = false; session.activeRideId = rideId;
    this.logRideEvent(ride, 'assignment_created', actor, driverId, { assignmentId: assignment.assignmentId, ackDeadlineAt: assignment.ackDeadlineAt });
    return assignment;
  }

  acknowledgeAssignment(rideId: string, driverId: string, decision: AssignmentDecision, reason?: string) {
    const ride = this.ensureMutableRide(rideId);
    const assignment = [...ride.assignmentAudit].reverse().find((a) => a.driverId === driverId && a.ackStatus === 'pending');
    if (!assignment) throw new Error('assignment_not_found');
    assignment.ackStatus = decision === 'accept' ? 'accepted' : decision === 'reject' ? 'rejected' : 'timeout'; assignment.decisionAt = new Date().toISOString(); assignment.reason = reason;
    const session = this.getSessionOrThrow(driverId);
    if (assignment.ackStatus === 'accepted') { session.state = 'en_route'; this.logRideEvent(ride, 'assignment_acknowledged', 'driver', driverId, { assignmentId: assignment.assignmentId }); }
    else { session.state = 'available'; session.available = true; session.activeRideId = undefined; ride.assignedDriverId = undefined; this.logRideEvent(ride, assignment.ackStatus === 'rejected' ? 'assignment_rejected' : 'assignment_reassigned', 'driver', driverId, { assignmentId: assignment.assignmentId, reason: reason ?? assignment.ackStatus }); }
    this.refreshRideRisk(rideId);
    return assignment;
  }

  markSlaRisk(rideId: string, reason: string, actor = 'system') { const ride = this.ensureMutableRide(rideId); ride.slaRisk = true; this.logRideEvent(ride, 'sla_risk_flagged', actor, ride.assignedDriverId, { reason }); this.refreshRideRisk(rideId); return ride; }
  tagIncident(rideId: string, tag: string, actor = 'dispatcher') { const ride = this.ensureMutableRide(rideId); if (!ride.incidentTags.includes(tag)) ride.incidentTags.push(tag); this.logRideEvent(ride, 'incident_tagged', actor, ride.assignedDriverId, { tag }); this.refreshRideRisk(rideId); return ride; }

  completeRide(rideId: string, actor = 'dispatcher') { const ride = this.ensureMutableRide(rideId); ride.lifecycle = 'completed'; ride.immutableAt = new Date().toISOString(); this.logRideEvent(ride, 'ride_completed_locked', actor, ride.assignedDriverId); if (ride.assignedDriverId) { const s = this.getSessionOrThrow(ride.assignedDriverId); s.state = 'cooldown'; s.activeRideId = undefined; s.available = false; } return ride; }

  refreshRideRisk(rideId: string) {
    const ride = this.ensureMutableRide(rideId);
    const now = Date.now();
    const assignmentAgeMs = ride.assignmentAudit.length ? now - new Date(ride.assignmentAudit[ride.assignmentAudit.length - 1]!.assignedAt).getTime() : 0;
    const reassignmentCount = ride.timeline.filter((e) => e.type === 'assignment_reassigned').length;
    ride.pickupRiskScore = Math.min(1, 0.2 + reassignmentCount * 0.2 + (assignmentAgeMs > 600000 ? 0.2 : 0));
    ride.etaBreachProbability = Math.min(1, ride.pickupRiskScore + (ride.slaRisk ? 0.25 : 0));
    ride.airportDelayRisk = Math.min(1, ride.incidentTags.some((t) => /airport|traffic/i.test(t)) ? 0.8 : 0.25);
    const blended = (ride.pickupRiskScore + ride.etaBreachProbability + ride.airportDelayRisk) / 3;
    ride.riskLevel = blended > 0.85 ? 'critical' : blended > 0.65 ? 'high' : blended > 0.4 ? 'medium' : 'low';
    ride.escalationSuggested = ride.riskLevel === 'critical' || (ride.slaRisk && ride.riskLevel === 'high');
    ride.lastPredictionAt = new Date().toISOString();
    return ride;
  }

  getDispatchRecommendations(rideId: string): DispatchRecommendation[] {
    const ride = this.createRideRecord(rideId);
    return Array.from(this.driverSessions.values()).map((session) => {
      const proximityScore = session.available ? 0.7 : 0.2;
      const reliabilityScore = session.stale ? 0.2 : 0.85;
      const workloadScore = session.activeRideId ? 0.1 : 1;
      const cooldownPenalty = session.state === 'cooldown' ? 0.35 : 0;
      const airportPriorityBonus = ride.incidentTags.some((t) => /airport/i.test(t)) && !session.stale ? 0.1 : 0;
      const score = Math.max(0, proximityScore * 0.4 + reliabilityScore * 0.35 + workloadScore * 0.25 + airportPriorityBonus - cooldownPenalty);
      const suggestedAction: DispatchRecommendation['suggestedAction'] = score > 0.72 ? 'assign' : score > 0.45 ? 'monitor' : 'hold';
      return {
        driverId: session.driverId,
        score: Number(score.toFixed(3)),
        reasonCodes: [session.available ? 'proximity_available' : 'proximity_limited', session.stale ? 'reliability_low' : 'reliability_high', session.activeRideId ? 'workload_busy' : 'workload_open', session.state === 'cooldown' ? 'cooldown_penalty' : 'cooldown_clear'],
        proximityScore,
        reliabilityScore,
        workloadScore,
        cooldownPenalty,
        suggestedAction,
      };
    }).sort((a, b) => b.score - a.score);
  }

  getOperationalRiskSnapshot(): OperationalRiskSnapshot {
    const rides = Array.from(this.rides.values());
    const drivers = Array.from(this.driverSessions.values());
    const overloadedDriverIds = drivers.filter((d) => Boolean(d.activeRideId) && d.state !== 'in_progress').map((d) => d.driverId);
    const slaRiskCount = rides.filter((r) => r.slaRisk).length;
    const incidentCount = rides.reduce((acc, r) => acc + r.incidentTags.length, 0);
    const dispatchSaturation = drivers.length === 0 ? 0 : rides.filter((r) => r.lifecycle === 'open' && !r.assignedDriverId).length / drivers.length;
    const score = Math.min(1, slaRiskCount * 0.12 + incidentCount * 0.06 + dispatchSaturation * 0.5 + overloadedDriverIds.length * 0.15);
    return { level: score > 0.85 ? 'critical' : score > 0.65 ? 'high' : score > 0.35 ? 'medium' : 'low', score: Number(score.toFixed(3)), flags: [slaRiskCount > 0 ? 'sla_pressure' : 'sla_stable', dispatchSaturation > 0.5 ? 'dispatch_saturated' : 'dispatch_balanced', overloadedDriverIds.length > 0 ? 'overload_detected' : 'overload_clear'], incidentProbability: Number(Math.min(1, score + 0.1).toFixed(3)), instabilityDetected: score > 0.65, overloadedDriverIds, dispatchSaturation: Number(dispatchSaturation.toFixed(3)) };
  }

  getRealtimeOperationalMetrics(): RealtimeOperationalMetrics {
    const rides = Array.from(this.rides.values());
    const allEvents = rides.flatMap((r) => r.timeline);
    const assignmentLatencies = rides.flatMap((r) => r.assignmentAudit.filter((a) => a.decisionAt).map((a) => new Date(a.decisionAt!).getTime() - new Date(a.assignedAt).getTime())).sort((a, b) => a - b);
    const p = (q: number) => assignmentLatencies.length ? assignmentLatencies[Math.min(assignmentLatencies.length - 1, Math.floor(assignmentLatencies.length * q))]! : 0;
    const reassignments = allEvents.filter((e) => e.type === 'assignment_reassigned').length;
    const staleSessionCount = Array.from(this.driverSessions.values()).filter((s) => s.stale).length;
    const recoveries = allEvents.filter((e) => e.type === 'session_recovered').length;
    return {
      generatedAt: new Date().toISOString(), totalRides: rides.length, openRides: rides.filter((r) => r.lifecycle === 'open').length, slaRiskRides: rides.filter((r) => r.slaRisk).length,
      assignmentsCreated: allEvents.filter((e) => e.type === 'assignment_created').length, assignmentLatencyMsP50: p(0.5), assignmentLatencyMsP95: p(0.95), reassignmentCount: reassignments,
      reassignmentRate: rides.length ? Number((reassignments / rides.length).toFixed(3)) : 0, incidentTaggedCount: allEvents.filter((e) => e.type === 'incident_tagged').length,
      recoverySuccessRate: staleSessionCount + recoveries === 0 ? 1 : Number((recoveries / (staleSessionCount + recoveries)).toFixed(3)), staleSessionCount, duplicatedEventBlockedCount: this.duplicateEventBlockedCount,
    };
  }

  getControlTowerIntelligenceView(): ControlTowerIntelligenceView {
    const rides = Array.from(this.rides.values()).map((r) => this.refreshRideRisk(r.rideId));
    const metrics = this.getRealtimeOperationalMetrics();
    const operationalRisk = this.getOperationalRiskSnapshot();
    const alerts: ControlTowerAlert[] = rides.filter((r) => r.escalationSuggested).map((r) => ({ alertId: crypto.randomUUID(), severity: r.riskLevel === 'critical' ? 'critical' : 'warning', category: 'sla', message: `Ride ${r.rideId} at ${r.riskLevel} risk`, rideId: r.rideId, driverId: r.assignedDriverId, createdAt: new Date().toISOString() }));
    if (operationalRisk.instabilityDetected) alerts.push({ alertId: crypto.randomUUID(), severity: 'critical', category: 'risk', message: 'Realtime instability detected in dispatch flow', createdAt: new Date().toISOString() });
    return { generatedAt: new Date().toISOString(), metrics, operationalRisk, alerts, highRiskRides: rides.filter((r) => r.riskLevel === 'high' || r.riskLevel === 'critical').map((r) => ({ rideId: r.rideId, riskLevel: r.riskLevel, pickupRiskScore: r.pickupRiskScore, etaBreachProbability: r.etaBreachProbability, airportDelayRisk: r.airportDelayRisk, assignedDriverId: r.assignedDriverId })) };
  }

  validateRealtimeSessions(actor = 'system') { const now = Date.now(); for (const s of this.driverSessions.values()) { const stale = now - new Date(s.lastHeartbeatAt).getTime() > HEARTBEAT_STALE_MS; if (stale && !s.stale) { s.stale = true; this.emitRideAgnosticEvent('session_stale_detected', actor, s.driverId, { lastHeartbeatAt: s.lastHeartbeatAt }); } } }
  recoverSession(driverId: string, actor = 'system') { const s = this.heartbeat(driverId); this.emitRideAgnosticEvent('session_recovered', actor, driverId, { recoveredAt: s.lastHeartbeatAt }); return s; }
  getLiveBoard(role: ControlTowerRole) { const drivers: DriverVisibilityView[] = Array.from(this.driverSessions.values()).filter((s) => role === 'founder' || s.roles.includes(role) || role === 'dispatcher').map((s) => ({ driverId: s.driverId, state: s.state, available: s.available, stale: s.stale, activeRideId: role === 'driver' ? undefined : s.activeRideId })); return { drivers, rides: Array.from(this.rides.values()).map((r) => ({ rideId: r.rideId, lifecycle: r.lifecycle, assignedDriverId: r.assignedDriverId, slaRisk: r.slaRisk, incidentTags: [...r.incidentTags], riskLevel: r.riskLevel, escalationSuggested: r.escalationSuggested })) }; }
  getRideTimeline(rideId: string) { return [...(this.rides.get(rideId)?.timeline ?? [])]; }

  private ensureMutableRide(rideId: string) { const ride = this.createRideRecord(rideId); if (ride.lifecycle === 'completed') throw new Error('immutable_completed_ride'); return ride; }
  private logRideEvent(ride: RideDispatchRecord, type: DispatchEvent['type'], actor: string, driverId?: string, details?: Record<string, unknown>) { ride.timeline.push({ eventId: crypto.randomUUID(), type, occurredAt: new Date().toISOString(), rideId: ride.rideId, actor, driverId, details }); }
  private emitRideAgnosticEvent(type: DispatchEvent['type'], actor: string, driverId: string, details?: Record<string, unknown>) { for (const ride of this.rides.values()) if (ride.assignedDriverId === driverId) this.logRideEvent(ride, type, actor, driverId, details); }
  private getSessionOrThrow(driverId: string) { const s = this.driverSessions.get(driverId); if (!s) throw new Error('driver_session_not_found'); const overloaded = Array.from(this.driverSessions.values()).filter((d) => d.activeRideId && d.driverId === driverId).length; if (overloaded > MAX_ACTIVE_RIDES_PER_DRIVER) throw new Error('driver_overload_prevented'); return s; }
}

export const controlTowerService = new ControlTowerService();

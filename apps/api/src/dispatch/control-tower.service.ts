import crypto from 'node:crypto';
import type {
  Assignment,
  AssignmentDecision,
  ControlTowerRole,
  DispatchEvent,
  DriverLifecycleState,
  DriverSession,
  DriverVisibilityView,
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

  registerDriverSession(driverId: string, roles: ControlTowerRole[] = ['driver']) {
    const now = new Date().toISOString();
    const session: DriverSession = {
      driverId,
      state: 'offline',
      available: false,
      lastHeartbeatAt: now,
      stale: false,
      roles,
    };
    this.driverSessions.set(driverId, session);
    return session;
  }

  heartbeat(driverId: string) {
    const session = this.getSessionOrThrow(driverId);
    session.lastHeartbeatAt = new Date().toISOString();
    session.stale = false;
    return session;
  }

  updateDriverState(driverId: string, nextState: DriverLifecycleState, actor = 'system') {
    const session = this.getSessionOrThrow(driverId);
    const allowed = STATE_TRANSITIONS[session.state];
    if (!allowed.includes(nextState)) {
      throw new Error(`invalid_transition:${session.state}->${nextState}`);
    }

    session.state = nextState;
    session.available = nextState === 'available';
    this.emitRideAgnosticEvent('driver_state_changed', actor, driverId, {
      state: nextState,
      available: session.available,
    });
    return session;
  }

  createRideRecord(rideId: string) {
    if (this.rides.has(rideId)) return this.rides.get(rideId)!;

    const record: RideDispatchRecord = {
      rideId,
      lifecycle: 'open',
      slaRisk: false,
      incidentTags: [],
      timeline: [],
      assignmentAudit: [],
    };
    this.rides.set(rideId, record);
    return record;
  }

  assignDriver(rideId: string, driverId: string, actor = 'dispatcher') {
    const ride = this.ensureMutableRide(rideId);
    const session = this.getSessionOrThrow(driverId);

    if (!session.available || session.state !== 'available') {
      throw new Error('driver_unavailable');
    }

    if (session.activeRideId) {
      throw new Error('assignment_conflict_detected');
    }

    if (ride.assignedDriverId === driverId && ride.assignmentAudit.some((a) => a.ackStatus === 'pending')) {
      throw new Error('duplicate_assignment_prevented');
    }

    const assignment: Assignment = {
      assignmentId: crypto.randomUUID(),
      rideId,
      driverId,
      assignedAt: new Date().toISOString(),
      ackDeadlineAt: new Date(Date.now() + ACK_TIMEOUT_MS).toISOString(),
      ackStatus: 'pending',
    };

    if (ride.assignedDriverId && ride.assignedDriverId !== driverId) {
      this.logRideEvent(ride, 'assignment_reassigned', actor, driverId, {
        previousDriverId: ride.assignedDriverId,
        reason: 'operational_reassignment',
      });
    }

    ride.assignedDriverId = driverId;
    ride.assignmentAudit.push(assignment);
    session.state = 'assigned';
    session.available = false;
    session.activeRideId = rideId;

    this.logRideEvent(ride, 'assignment_created', actor, driverId, {
      assignmentId: assignment.assignmentId,
      ackDeadlineAt: assignment.ackDeadlineAt,
    });
    return assignment;
  }

  acknowledgeAssignment(rideId: string, driverId: string, decision: AssignmentDecision, reason?: string) {
    const ride = this.ensureMutableRide(rideId);
    const assignment = [...ride.assignmentAudit].reverse().find((a) => a.driverId === driverId && a.ackStatus === 'pending');
    if (!assignment) throw new Error('assignment_not_found');

    assignment.ackStatus = decision === 'accept' ? 'accepted' : decision === 'reject' ? 'rejected' : 'timeout';
    assignment.decisionAt = new Date().toISOString();
    assignment.reason = reason;

    const session = this.getSessionOrThrow(driverId);

    if (assignment.ackStatus === 'accepted') {
      session.state = 'en_route';
      this.logRideEvent(ride, 'assignment_acknowledged', 'driver', driverId, {
        assignmentId: assignment.assignmentId,
      });
      return assignment;
    }

    session.state = 'available';
    session.available = true;
    session.activeRideId = undefined;
    ride.assignedDriverId = undefined;
    this.logRideEvent(
      ride,
      assignment.ackStatus === 'rejected' ? 'assignment_rejected' : 'assignment_reassigned',
      'driver',
      driverId,
      { assignmentId: assignment.assignmentId, reason: reason ?? assignment.ackStatus },
    );
    return assignment;
  }

  markSlaRisk(rideId: string, reason: string, actor = 'system') {
    const ride = this.ensureMutableRide(rideId);
    ride.slaRisk = true;
    this.logRideEvent(ride, 'sla_risk_flagged', actor, ride.assignedDriverId, { reason });
    return ride;
  }

  tagIncident(rideId: string, tag: string, actor = 'dispatcher') {
    const ride = this.ensureMutableRide(rideId);
    if (!ride.incidentTags.includes(tag)) ride.incidentTags.push(tag);
    this.logRideEvent(ride, 'incident_tagged', actor, ride.assignedDriverId, { tag });
    return ride;
  }

  completeRide(rideId: string, actor = 'dispatcher') {
    const ride = this.ensureMutableRide(rideId);
    ride.lifecycle = 'completed';
    ride.immutableAt = new Date().toISOString();
    this.logRideEvent(ride, 'ride_completed_locked', actor, ride.assignedDriverId);

    if (ride.assignedDriverId) {
      const session = this.getSessionOrThrow(ride.assignedDriverId);
      session.state = 'cooldown';
      session.activeRideId = undefined;
      session.available = false;
    }
    return ride;
  }

  validateRealtimeSessions(actor = 'system') {
    const now = Date.now();
    for (const session of this.driverSessions.values()) {
      const stale = now - new Date(session.lastHeartbeatAt).getTime() > HEARTBEAT_STALE_MS;
      if (stale && !session.stale) {
        session.stale = true;
        this.emitRideAgnosticEvent('session_stale_detected', actor, session.driverId, {
          lastHeartbeatAt: session.lastHeartbeatAt,
        });
      }
    }
  }

  recoverSession(driverId: string, actor = 'system') {
    const session = this.heartbeat(driverId);
    this.emitRideAgnosticEvent('session_recovered', actor, driverId, { recoveredAt: session.lastHeartbeatAt });
    return session;
  }

  getLiveBoard(role: ControlTowerRole) {
    const drivers: DriverVisibilityView[] = Array.from(this.driverSessions.values())
      .filter((session) => role === 'founder' || session.roles.includes(role) || role === 'dispatcher')
      .map((session) => ({
        driverId: session.driverId,
        state: session.state,
        available: session.available,
        stale: session.stale,
        activeRideId: role === 'driver' ? undefined : session.activeRideId,
      }));

    return {
      drivers,
      rides: Array.from(this.rides.values()).map((ride) => ({
        rideId: ride.rideId,
        lifecycle: ride.lifecycle,
        assignedDriverId: ride.assignedDriverId,
        slaRisk: ride.slaRisk,
        incidentTags: [...ride.incidentTags],
      })),
    };
  }

  getRideTimeline(rideId: string) {
    const ride = this.rides.get(rideId);
    if (!ride) return [];
    return [...ride.timeline];
  }

  private ensureMutableRide(rideId: string) {
    const ride = this.createRideRecord(rideId);
    if (ride.lifecycle === 'completed') throw new Error('immutable_completed_ride');
    return ride;
  }

  private logRideEvent(ride: RideDispatchRecord, type: DispatchEvent['type'], actor: string, driverId?: string, details?: Record<string, unknown>) {
    ride.timeline.push({ eventId: crypto.randomUUID(), type, occurredAt: new Date().toISOString(), rideId: ride.rideId, actor, driverId, details });
  }

  private emitRideAgnosticEvent(type: DispatchEvent['type'], actor: string, driverId: string, details?: Record<string, unknown>) {
    for (const ride of this.rides.values()) {
      if (ride.assignedDriverId === driverId) {
        this.logRideEvent(ride, type, actor, driverId, details);
      }
    }
  }

  private getSessionOrThrow(driverId: string) {
    const session = this.driverSessions.get(driverId);
    if (!session) throw new Error('driver_session_not_found');
    const overloaded = Array.from(this.driverSessions.values()).filter((s) => s.activeRideId && s.driverId === driverId).length;
    if (overloaded > MAX_ACTIVE_RIDES_PER_DRIVER) throw new Error('driver_overload_prevented');
    return session;
  }
}

export const controlTowerService = new ControlTowerService();

export type DriverLifecycleState =
  | 'available'
  | 'assigned'
  | 'en_route'
  | 'pickup'
  | 'in_progress'
  | 'cooldown'
  | 'offline';

export type DispatchEventType =
  | 'driver_state_changed'
  | 'assignment_created'
  | 'assignment_acknowledged'
  | 'assignment_rejected'
  | 'assignment_reassigned'
  | 'sla_risk_flagged'
  | 'incident_tagged'
  | 'session_stale_detected'
  | 'session_recovered'
  | 'ride_completed_locked';

export type AssignmentDecision = 'accept' | 'reject' | 'timeout';

export type ControlTowerRole = 'founder' | 'dispatcher' | 'driver';
export type OperationalRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface DriverSession {
  driverId: string;
  state: DriverLifecycleState;
  available: boolean;
  activeRideId?: string;
  lastHeartbeatAt: string;
  stale: boolean;
  roles: ControlTowerRole[];
}

export interface Assignment {
  assignmentId: string;
  rideId: string;
  driverId: string;
  assignedAt: string;
  ackDeadlineAt: string;
  ackStatus: 'pending' | 'accepted' | 'rejected' | 'timeout';
  decisionAt?: string;
  reason?: string;
}

export interface DispatchRecommendation {
  driverId: string;
  score: number;
  reasonCodes: string[];
  proximityScore: number;
  reliabilityScore: number;
  workloadScore: number;
  cooldownPenalty: number;
  suggestedAction: 'assign' | 'monitor' | 'hold';
}

export interface DispatchEvent {
  eventId: string;
  type: DispatchEventType;
  rideId?: string;
  driverId?: string;
  occurredAt: string;
  actor: string;
  details?: Record<string, unknown>;
}

export interface OperationalRiskSnapshot {
  level: OperationalRiskLevel;
  score: number;
  flags: string[];
  incidentProbability: number;
  instabilityDetected: boolean;
  overloadedDriverIds: string[];
  dispatchSaturation: number;
}

export interface RealtimeOperationalMetrics {
  generatedAt: string;
  totalRides: number;
  openRides: number;
  slaRiskRides: number;
  assignmentsCreated: number;
  assignmentLatencyMsP50: number;
  assignmentLatencyMsP95: number;
  reassignmentCount: number;
  reassignmentRate: number;
  incidentTaggedCount: number;
  recoverySuccessRate: number;
  staleSessionCount: number;
  duplicatedEventBlockedCount: number;
}

export interface RideDispatchRecord {
  rideId: string;
  lifecycle: 'open' | 'completed' | 'cancelled';
  assignedDriverId?: string;
  slaRisk: boolean;
  incidentTags: string[];
  immutableAt?: string;
  timeline: DispatchEvent[];
  assignmentAudit: Assignment[];
  riskLevel: OperationalRiskLevel;
  pickupRiskScore: number;
  etaBreachProbability: number;
  airportDelayRisk: number;
  escalationSuggested: boolean;
  lastPredictionAt?: string;
}

export interface DriverVisibilityView {
  driverId: string;
  state: DriverLifecycleState;
  available: boolean;
  activeRideId?: string;
  stale: boolean;
}

export interface ControlTowerAlert {
  alertId: string;
  severity: 'info' | 'warning' | 'critical';
  category: 'sla' | 'dispatch' | 'risk' | 'resilience';
  message: string;
  rideId?: string;
  driverId?: string;
  createdAt: string;
}

export interface ControlTowerIntelligenceView {
  generatedAt: string;
  metrics: RealtimeOperationalMetrics;
  operationalRisk: OperationalRiskSnapshot;
  alerts: ControlTowerAlert[];
  highRiskRides: Array<{
    rideId: string;
    riskLevel: OperationalRiskLevel;
    pickupRiskScore: number;
    etaBreachProbability: number;
    airportDelayRisk: number;
    assignedDriverId?: string;
  }>;
}

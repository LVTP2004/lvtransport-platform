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

export interface DispatchEvent {
  eventId: string;
  type: DispatchEventType;
  rideId?: string;
  driverId?: string;
  occurredAt: string;
  actor: string;
  details?: Record<string, unknown>;
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
}

export interface DriverVisibilityView {
  driverId: string;
  state: DriverLifecycleState;
  available: boolean;
  activeRideId?: string;
  stale: boolean;
}

export enum InterimWorkerLifecycleState {
  ONBOARDING = 'onboarding',
  VERIFIED_READY = 'verified_ready',
  ACTIVE_POOL = 'active_pool',
  SOFT_BLOCKED = 'soft_blocked',
  INACTIVE = 'inactive',
}

export enum InterimWorkerAvailabilityState {
  OFFLINE = 'offline',
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  DISPATCHING = 'dispatching',
  ON_ASSIGNMENT = 'on_assignment',
  ON_BREAK = 'on_break',
  UNAVAILABLE = 'unavailable',
}

export enum StaffingRequestState {
  DRAFT = 'draft',
  OPEN = 'open',
  MATCHING = 'matching',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  ESCALATED = 'escalated',
  CANCELLED = 'cancelled',
}

export enum EmergencyReplacementState {
  REPORTED = 'reported',
  TRIAGED = 'triaged',
  BLAST_DISPATCH = 'blast_dispatch',
  STABILIZED = 'stabilized',
  CLOSED = 'closed',
}

export enum TemporaryAssignmentState {
  OFFERED = 'offered',
  ACCEPTED = 'accepted',
  CONFIRMED = 'confirmed',
  EN_ROUTE = 'en_route',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum DispatchPriority {
  STANDARD = 'standard',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

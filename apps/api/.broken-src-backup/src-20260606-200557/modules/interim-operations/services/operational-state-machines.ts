export type OperationalEntityType = 'ride' | 'payment' | 'notification' | 'recovery';

export type RideLifecycleState =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_customer'
  | 'cancelled_by_driver'
  | 'cancelled_by_admin'
  | 'failed';

export type PaymentLifecycleState =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'refund_pending'
  | 'refunded'
  | 'failed'
  | 'recovery_pending'
  | 'recovered';

export type NotificationLifecycleState =
  | 'pending'
  | 'queued_for_dispatch'
  | 'dispatched'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'cancelled';

export type RecoveryLifecycleState =
  | 'not_required'
  | 'replay_requested'
  | 'replay_running'
  | 'replay_applied'
  | 'replay_skipped_idempotent'
  | 'replay_failed'
  | 'manual_review_required'
  | 'resolved';

export type OperationalState =
  | RideLifecycleState
  | PaymentLifecycleState
  | NotificationLifecycleState
  | RecoveryLifecycleState;

export type TransitionValidationResult =
  | { allowed: true; reason: 'ALLOWED' | 'NO_OP_IDEMPOTENT' }
  | { allowed: false; reason: 'INVALID_ENTITY' | 'UNKNOWN_STATE' | 'TERMINAL_IMMUTABLE' | 'FORBIDDEN_TRANSITION' };

const TERMINAL_STATES: Record<OperationalEntityType, Set<string>> = {
  ride: new Set(['completed', 'cancelled_by_customer', 'cancelled_by_driver', 'cancelled_by_admin', 'failed']),
  payment: new Set(['paid', 'refunded', 'failed']),
  notification: new Set(['read', 'cancelled', 'failed']),
  recovery: new Set(['resolved'])
};

const ALLOWED_TRANSITIONS: Record<OperationalEntityType, Record<string, Set<string>>> = {
  ride: {
    pending: new Set(['assigned', 'cancelled_by_customer', 'cancelled_by_admin', 'failed']),
    assigned: new Set(['accepted', 'cancelled_by_driver', 'cancelled_by_admin', 'failed']),
    accepted: new Set(['en_route', 'cancelled_by_driver', 'cancelled_by_admin', 'failed']),
    en_route: new Set(['arrived', 'cancelled_by_driver', 'cancelled_by_admin', 'failed']),
    arrived: new Set(['in_progress', 'cancelled_by_customer', 'cancelled_by_admin', 'failed']),
    in_progress: new Set(['completed', 'cancelled_by_admin', 'failed']),
    completed: new Set(),
    cancelled_by_customer: new Set(),
    cancelled_by_driver: new Set(),
    cancelled_by_admin: new Set(),
    failed: new Set()
  },
  payment: {
    pending: new Set(['authorized', 'failed', 'recovery_pending']),
    authorized: new Set(['paid', 'failed', 'recovery_pending']),
    paid: new Set(['refund_pending']),
    refund_pending: new Set(['refunded', 'recovery_pending']),
    refunded: new Set(),
    failed: new Set(),
    recovery_pending: new Set(['recovered', 'failed']),
    recovered: new Set(['pending'])
  },
  notification: {
    pending: new Set(['queued_for_dispatch', 'cancelled']),
    queued_for_dispatch: new Set(['dispatched', 'failed', 'cancelled']),
    dispatched: new Set(['delivered', 'failed']),
    delivered: new Set(['read', 'failed']),
    read: new Set(),
    failed: new Set(['queued_for_dispatch']),
    cancelled: new Set()
  },
  recovery: {
    not_required: new Set(['replay_requested']),
    replay_requested: new Set(['replay_running', 'manual_review_required']),
    replay_running: new Set(['replay_applied', 'replay_skipped_idempotent', 'replay_failed']),
    replay_applied: new Set(['resolved']),
    replay_skipped_idempotent: new Set(['resolved']),
    replay_failed: new Set(['replay_requested', 'manual_review_required']),
    manual_review_required: new Set(['replay_requested', 'resolved']),
    resolved: new Set()
  }
};

export const validateOperationalTransition = (
  entity: string,
  currentState: string,
  nextState: string
): TransitionValidationResult => {
  if (!(entity in ALLOWED_TRANSITIONS)) return { allowed: false, reason: 'INVALID_ENTITY' };

  const typedEntity = entity as OperationalEntityType;
  const entityMap = ALLOWED_TRANSITIONS[typedEntity];

  if (!(currentState in entityMap) || !(nextState in entityMap)) {
    return { allowed: false, reason: 'UNKNOWN_STATE' };
  }

  if (currentState === nextState) return { allowed: true, reason: 'NO_OP_IDEMPOTENT' };

  if (TERMINAL_STATES[typedEntity].has(currentState)) {
    return { allowed: false, reason: 'TERMINAL_IMMUTABLE' };
  }

  if (!entityMap[currentState].has(nextState)) {
    return { allowed: false, reason: 'FORBIDDEN_TRANSITION' };
  }

  return { allowed: true, reason: 'ALLOWED' };
};

export type TransitionAuditEntry = {
  previous_state: string;
  next_state: string;
  entity_type: OperationalEntityType;
  entity_id: string;
  actor_id?: string;
  correlation_id?: string;
  request_id?: string;
  timestamp: string;
  reason: string;
};

export const buildTransitionAuditEntry = (input: {
  previousState: string;
  nextState: string;
  entityType: OperationalEntityType;
  entityId: string;
  actorId?: string;
  correlationId?: string;
  requestId?: string;
  reason: string;
  timestamp?: string;
}): TransitionAuditEntry => ({
  previous_state: input.previousState,
  next_state: input.nextState,
  entity_type: input.entityType,
  entity_id: input.entityId,
  actor_id: input.actorId,
  correlation_id: input.correlationId,
  request_id: input.requestId,
  timestamp: input.timestamp ?? new Date().toISOString(),
  reason: input.reason
});

export const OPERATIONAL_STATE_MACHINES = ALLOWED_TRANSITIONS;

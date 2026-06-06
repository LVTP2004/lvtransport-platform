import { CANONICAL_ALLOWED_TRANSITIONS, TERMINAL_BOOKING_STATUSES, type CanonicalBookingLifecycleStatus } from '../../types/lifecycle.js';

export type LifecycleTransitionValidationInput = {
  currentState: CanonicalBookingLifecycleStatus;
  nextState: CanonicalBookingLifecycleStatus;
  currentVersion: number;
  expectedVersion?: number;
};

export type LifecycleTransitionValidationResult =
  | { ok: true; duplicate: boolean }
  | {
      ok: false;
      reason: 'VERSION_MISMATCH' | 'TERMINAL_IMMUTABLE' | 'INVALID_TRANSITION';
      details: Record<string, unknown>;
    };

export const validateLifecycleTransition = (
  input: LifecycleTransitionValidationInput
): LifecycleTransitionValidationResult => {
  const { currentState, nextState, currentVersion, expectedVersion } = input;

  if (typeof expectedVersion === 'number' && expectedVersion !== currentVersion) {
    return {
      ok: false,
      reason: 'VERSION_MISMATCH',
      details: { expectedVersion, currentVersion, currentState, attemptedState: nextState }
    };
  }

  if (currentState === nextState) return { ok: true, duplicate: true };

  if (TERMINAL_BOOKING_STATUSES.has(currentState)) {
    return {
      ok: false,
      reason: 'TERMINAL_IMMUTABLE',
      details: { currentState, attemptedState: nextState }
    };
  }

  if (!CANONICAL_ALLOWED_TRANSITIONS[currentState].has(nextState)) {
    return {
      ok: false,
      reason: 'INVALID_TRANSITION',
      details: { currentState, attemptedState: nextState }
    };
  }

  return { ok: true, duplicate: false };
};

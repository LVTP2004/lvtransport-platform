export type DomainErrorCode =
  | 'BOOKING_NOT_FOUND'
  | 'DRIVER_NOT_FOUND'
  | 'DRIVER_UNAVAILABLE'
  | 'BOOKING_ALREADY_ASSIGNED'
  | 'INVALID_ASSIGNMENT_STATE'
  | 'INVALID_TRANSITION'
  | 'BOOKING_VERSION_CONFLICT'
  | 'TERMINAL_STATE_IMMUTABLE'
  | 'DUPLICATE_EVENT_IGNORED'
  | 'STALE_EVENT_REJECTED'
  | 'REALTIME_RESYNC_REQUIRED'
  | 'OPERATIONAL_STATE_DEGRADED'
  | 'MANUAL_INTERVENTION_REQUIRED';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export const isDomainError = (error: unknown): error is DomainError => error instanceof DomainError;

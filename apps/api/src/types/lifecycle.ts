export const CANONICAL_BOOKING_LIFECYCLE = [
  'pending',
  'assigned',
  'accepted',
  'en_route',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'failed'
] as const;

export type CanonicalBookingLifecycleStatus = (typeof CANONICAL_BOOKING_LIFECYCLE)[number];

export const TERMINAL_BOOKING_STATUSES = new Set<CanonicalBookingLifecycleStatus>(['completed', 'cancelled', 'failed']);

export const LEGACY_BOOKING_STATE_MAP: Record<string, CanonicalBookingLifecycleStatus> = {
  driver_arriving: 'en_route',
  passenger_onboard: 'in_progress',
  onderweg: 'en_route',
  completed: 'completed',
  cancelled: 'cancelled'
};

export const CANONICAL_ALLOWED_TRANSITIONS: Record<CanonicalBookingLifecycleStatus, ReadonlySet<CanonicalBookingLifecycleStatus>> = {
  pending: new Set(['assigned', 'cancelled', 'failed']),
  assigned: new Set(['accepted', 'cancelled', 'failed']),
  accepted: new Set(['en_route', 'cancelled', 'failed']),
  en_route: new Set(['arrived', 'cancelled', 'failed']),
  arrived: new Set(['in_progress', 'cancelled', 'failed']),
  in_progress: new Set(['completed', 'cancelled', 'failed']),
  completed: new Set(),
  cancelled: new Set(),
  failed: new Set()
};

export const toCanonicalBookingStatus = (status?: string | null): CanonicalBookingLifecycleStatus => {
  if (!status) return 'pending';
  if ((CANONICAL_BOOKING_LIFECYCLE as readonly string[]).includes(status)) return status as CanonicalBookingLifecycleStatus;
  return LEGACY_BOOKING_STATE_MAP[status] ?? 'pending';
};

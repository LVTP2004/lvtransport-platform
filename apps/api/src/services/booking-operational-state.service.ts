export const BOOKING_LIFECYCLE = [
  'pending',
  'accepted',
  'quoted',
  'confirmed',
  'available',
  'assigned',
  'onderweg',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'failed'
] as const;

export type BookingLifecycleStatus = (typeof BOOKING_LIFECYCLE)[number];
export type BookingActor = 'customer' | 'admin' | 'driver' | 'system';

export type BookingTransitionResult =
  | { outcome: 'applied'; status: BookingLifecycleStatus }
  | { outcome: 'noop_duplicate'; status: BookingLifecycleStatus }
  | { outcome: 'rejected_invalid_transition'; status: BookingLifecycleStatus };

const terminalStatuses = new Set<BookingLifecycleStatus>(['completed', 'cancelled', 'failed']);

const allowedTransitions: Record<BookingLifecycleStatus, ReadonlySet<BookingLifecycleStatus>> = {
  pending: new Set(['accepted', 'quoted', 'cancelled', 'failed']),
  accepted: new Set(['quoted', 'confirmed', 'available', 'assigned', 'cancelled', 'failed']),
  quoted: new Set(['confirmed', 'available', 'cancelled', 'failed']),
  confirmed: new Set(['available', 'assigned', 'cancelled', 'failed']),
  available: new Set(['assigned', 'cancelled', 'failed']),
  assigned: new Set(['onderweg', 'cancelled', 'failed']),
  onderweg: new Set(['arrived', 'cancelled', 'failed']),
  arrived: new Set(['in_progress', 'cancelled', 'failed']),
  in_progress: new Set(['completed', 'cancelled', 'failed']),
  completed: new Set(),
  cancelled: new Set(),
  failed: new Set()
};

export const bookingOperationalState = {
  isTerminal(status: BookingLifecycleStatus): boolean {
    return terminalStatuses.has(status);
  },

  canTransition(from: BookingLifecycleStatus, to: BookingLifecycleStatus): boolean {
    return allowedTransitions[from].has(to);
  },

  transition(current: BookingLifecycleStatus, next: BookingLifecycleStatus): BookingTransitionResult {
    if (current === next) {
      return { outcome: 'noop_duplicate', status: current };
    }
    if (terminalStatuses.has(current)) {
      return { outcome: 'rejected_invalid_transition', status: current };
    }
    if (!allowedTransitions[current].has(next)) {
      return { outcome: 'rejected_invalid_transition', status: current };
    }
    return { outcome: 'applied', status: next };
  }
};

export const realtimeOperationalEvents = {
  bookingCreated: 'booking.created',
  bookingUpdated: 'booking.updated',
  bookingLifecycleChanged: 'booking.lifecycle.changed',
  bookingSnapshot: 'booking.snapshot',
  driverSnapshot: 'driver.snapshot',
  driverAssigned: 'driver.assigned',
  driverStatusUpdated: 'driver.status.updated',
  adminLiveUpdated: 'admin.live.updated',
  operationalLogSnapshot: 'operational.log.snapshot'
} as const;

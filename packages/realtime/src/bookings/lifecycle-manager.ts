export enum BookingLifecycle {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export enum CanonicalBookingLifecycle {
  PENDING_ASSIGNMENT = 'PENDING_ASSIGNMENT',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  DRIVER_ON_ROUTE = 'DRIVER_ON_ROUTE',
  DRIVER_ARRIVED = 'DRIVER_ARRIVED',
  RIDE_ACTIVE = 'RIDE_ACTIVE',
  RIDE_COMPLETED = 'RIDE_COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED_RECOVERY = 'FAILED_RECOVERY'
}

export const isImmutableLifecycleStatus = (status: string): boolean => {
  return [
    BookingLifecycle.COMPLETED,
    BookingLifecycle.CANCELLED,
    BookingLifecycle.FAILED,
    CanonicalBookingLifecycle.RIDE_COMPLETED,
    CanonicalBookingLifecycle.CANCELLED,
    CanonicalBookingLifecycle.FAILED_RECOVERY
  ].includes(status as any);
};

export function toCanonicalLifecycle(status: BookingLifecycle): CanonicalBookingLifecycle {
  const map: Record<BookingLifecycle, CanonicalBookingLifecycle> = {
    [BookingLifecycle.PENDING]: CanonicalBookingLifecycle.PENDING_ASSIGNMENT,
    [BookingLifecycle.ASSIGNED]: CanonicalBookingLifecycle.DRIVER_ASSIGNED,
    [BookingLifecycle.ACCEPTED]: CanonicalBookingLifecycle.DRIVER_ON_ROUTE,
    [BookingLifecycle.EN_ROUTE]: CanonicalBookingLifecycle.DRIVER_ON_ROUTE,
    [BookingLifecycle.ARRIVED]: CanonicalBookingLifecycle.DRIVER_ARRIVED,
    [BookingLifecycle.IN_PROGRESS]: CanonicalBookingLifecycle.RIDE_ACTIVE,
    [BookingLifecycle.COMPLETED]: CanonicalBookingLifecycle.RIDE_COMPLETED,
    [BookingLifecycle.CANCELLED]: CanonicalBookingLifecycle.CANCELLED,
    [BookingLifecycle.FAILED]: CanonicalBookingLifecycle.FAILED_RECOVERY
  };

  return map[status];
}

export function canTransitionCanonicalLifecycle(
  from: CanonicalBookingLifecycle,
  to: CanonicalBookingLifecycle
): boolean {
  if (isImmutableLifecycleStatus(from)) return false;
  if (from === to) return true;
  return true;
}

export class BookingLifecycleManager {
  toCanonicalLifecycle(status: BookingLifecycle): CanonicalBookingLifecycle {
    return toCanonicalLifecycle(status);
  }

  canTransition(from: CanonicalBookingLifecycle, to: CanonicalBookingLifecycle): boolean {
    return canTransitionCanonicalLifecycle(from, to);
  }

  isImmutable(status: string): boolean {
    return isImmutableLifecycleStatus(status);
  }
}

export default BookingLifecycleManager;

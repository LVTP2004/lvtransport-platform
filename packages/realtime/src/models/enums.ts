export enum BookingLifecycle {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EN_ROUTE = 'en_route',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  ASSIGNED = 'assigned',
    COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

export enum DriverState {
  OFFLINE = 'offline',
  ONLINE = 'online',
  AVAILABLE = 'available',
  DISPATCHED = 'dispatched',
  ON_TRIP = 'on_trip',
  PAUSED = 'paused'
}

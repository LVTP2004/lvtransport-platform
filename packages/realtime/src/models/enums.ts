export enum BookingLifecycle {
  PENDING = 'pending',
  QUOTED = 'quoted',
  CONFIRMED = 'confirmed',
  ASSIGNED = 'assigned',
  DRIVER_ARRIVING = 'driver_arriving',
  PASSENGER_ONBOARD = 'passenger_onboard',
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

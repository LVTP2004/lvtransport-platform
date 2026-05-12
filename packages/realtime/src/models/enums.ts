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


export enum TrackingState {
  SEARCHING_DRIVER = 'searching_driver',
  DRIVER_ASSIGNED = 'driver_assigned',
  DRIVER_EN_ROUTE = 'driver_en_route',
  DRIVER_ARRIVED = 'driver_arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

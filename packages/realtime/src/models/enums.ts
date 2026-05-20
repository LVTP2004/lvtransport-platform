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

export enum CanonicalBookingLifecycle {
  BOOKING_CREATED = 'booking_created',
  PENDING_ASSIGNMENT = 'pending_assignment',
  DRIVER_ASSIGNED = 'driver_assigned',
  DRIVER_ON_ROUTE = 'driver_on_route',
  DRIVER_ARRIVED = 'driver_arrived',
  PASSENGER_ONBOARD = 'passenger_onboard',
  RIDE_ACTIVE = 'ride_active',
  RIDE_COMPLETED = 'ride_completed',
  CANCELLED = 'cancelled',
  FAILED_RECOVERY = 'failed_recovery'
}

export enum DriverState {
  OFFLINE = 'offline',
  ONLINE = 'online',
  AVAILABLE = 'available',
  DISPATCHED = 'dispatched',
  ON_TRIP = 'on_trip',
  PAUSED = 'paused'
}

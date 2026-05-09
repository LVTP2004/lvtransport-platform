export enum BookingLifecycle {
  CREATED = "created",
  REQUESTED = "requested",
  DRIVER_ASSIGNED = "driver_assigned",
  DRIVER_EN_ROUTE = "driver_en_route",
  DRIVER_ARRIVED = "driver_arrived",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum DriverState {
  OFFLINE = "offline",
  ONLINE = "online",
  AVAILABLE = "available",
  DISPATCHED = "dispatched",
  ON_TRIP = "on_trip",
  PAUSED = "paused"
}

export enum TrackingState {
  NOT_STARTED = "not_started",
  SEARCHING_DRIVER = "searching_driver",
  DRIVER_ASSIGNED = "driver_assigned",
  DRIVER_APPROACHING = "driver_approaching",
  TRIP_ACTIVE = "trip_active",
  TRIP_COMPLETED = "trip_completed",
  TRACKING_ENDED = "tracking_ended"
}

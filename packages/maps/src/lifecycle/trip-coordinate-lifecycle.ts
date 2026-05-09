export type TripCoordinateLifecycleStage =
  | 'requested'
  | 'driver_assigned'
  | 'driver_arriving'
  | 'passenger_onboard'
  | 'trip_in_progress'
  | 'dropoff_arriving'
  | 'trip_completed'
  | 'trip_archived';

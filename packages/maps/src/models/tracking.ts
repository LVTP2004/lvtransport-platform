import type { Coordinate } from './coordinates';

export type DriverLiveMarker = {
  driverId: string;
  vehicleId?: string;
  coordinate: Coordinate;
  speedKph?: number;
  status: 'available' | 'enroute_pickup' | 'on_trip' | 'offline';
};

export type CustomerTrackingView = {
  bookingId: string;
  customerId: string;
  driverMarker?: DriverLiveMarker;
  pickupEtaSeconds?: number;
  dropoffEtaSeconds?: number;
};

export type RealtimeMapEvent<TPayload = unknown> = {
  name: string;
  occurredAt: string;
  tripId?: string;
  payload: TPayload;
};

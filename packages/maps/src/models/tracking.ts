import type { Coordinate } from './coordinates';

export type DriverLiveMarker = {
  driverId: string;
  vehicleId?: string;
  coordinate: Coordinate;
  speedKph?: number;
  status: 'available' | 'enroute_pickup' | 'on_trip' | 'offline';
};

export type EtaSnapshot = {
  etaSeconds?: number;
  distanceRemainingMeters: number;
  computedAt: string;
  stale: boolean;
  reason?: 'stale-telemetry' | 'ride-completed' | 'no-route';
};

export type CustomerTrackingView = {
  bookingId: string;
  customerId: string;
  driverMarker?: DriverLiveMarker;
  pickupEtaSeconds?: number;
  dropoffEtaSeconds?: number;
  operationalEta?: EtaSnapshot;
};

export type AdminOperationalTrackingView = {
  tripId: string;
  sessionId: string;
  driverMarker?: DriverLiveMarker;
  operationalEta: EtaSnapshot;
  routeCompletionRatio: number;
  routingSynchronizedAt?: string;
};

export type RealtimeMapEvent<TPayload = unknown> = {
  name: string;
  occurredAt: string;
  tripId?: string;
  payload: TPayload;
};

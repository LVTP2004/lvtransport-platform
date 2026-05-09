import type { Coordinate } from './coordinates';

export type TripRouteSegment = {
  id: string;
  kind: 'pickup' | 'enroute' | 'dropoff' | 'reposition';
  polyline: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
};

export type TripRouteModel = {
  routeId: string;
  tripId: string;
  version: number;
  segments: TripRouteSegment[];
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  source: 'directions-api' | 'manual' | 'recalculated';
};

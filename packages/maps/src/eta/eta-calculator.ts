import type { DriverLiveMarker } from '../models/tracking';
import type { TripRouteModel } from '../models/routes';

export type EtaContext = {
  route: TripRouteModel;
  driver: DriverLiveMarker;
  trafficMultiplier?: number;
};

export type EtaCalculator = {
  calculate(context: EtaContext): number;
};

export const defaultEtaCalculator: EtaCalculator = {
  calculate: ({ route, trafficMultiplier = 1 }) =>
    Math.round(route.totalDurationSeconds * trafficMultiplier),
};

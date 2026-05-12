import type { Coordinate } from '../models/coordinates';
import type { TripRouteModel } from '../models/routes';
import type { MapProvider, RouteRequestContext } from '../providers/map-provider';

export type OperationalRouteRequest = {
  waypoints: Coordinate[];
  context?: RouteRequestContext;
};

export type RouteDiagnostics = {
  routePoints: number;
  hasGeometry: boolean;
  checksum: string;
};

export type OperationalRouteService = {
  createRoute(request: OperationalRouteRequest): Promise<TripRouteModel>;
  diagnostics(route: TripRouteModel): RouteDiagnostics;
};

const checksumForRoute = (route: TripRouteModel): string =>
  `${route.tripId}:${route.version}:${route.totalDistanceMeters}:${route.totalDurationSeconds}`;

export const createOperationalRouteService = (
  provider: MapProvider,
): OperationalRouteService => ({
  createRoute: async (request) => provider.getDirections(request.waypoints, request.context),
  diagnostics: (route) => ({
    routePoints: route.segments.reduce((total, segment) => total + segment.polyline.length, 0),
    hasGeometry: route.segments.some((segment) => segment.polyline.length > 1),
    checksum: checksumForRoute(route),
  }),
});

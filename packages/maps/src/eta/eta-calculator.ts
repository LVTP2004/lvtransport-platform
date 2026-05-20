import type { Coordinate } from '../models/coordinates';
import type { TripRouteModel, TripRouteSegment } from '../models/routes';
import type { DriverLiveMarker } from '../models/tracking';

export type EtaTelemetryPoint = {
  coordinate: Coordinate;
  observedAt: string;
  speedKph?: number;
};

export type EtaContext = {
  route: TripRouteModel;
  driver: DriverLiveMarker;
  telemetry: EtaTelemetryPoint;
  staleAfterMs?: number;
  trafficMultiplier?: number;
  minimumOperationalSpeedKph?: number;
};

export type RouteProgressEstimate = {
  completedDistanceMeters: number;
  remainingDistanceMeters: number;
  completionRatio: number;
  currentSegmentId?: string;
};

export type EtaDiagnostics = {
  telemetryAgeMs: number;
  staleTelemetry: boolean;
  effectiveSpeedKph: number;
  fallbackToRouteDuration: boolean;
  estimatedArrivalAt?: string;
};

export type EtaResult = {
  etaSeconds?: number;
  progress: RouteProgressEstimate;
  diagnostics: EtaDiagnostics;
};

export type EtaCalculator = {
  calculate(context: EtaContext): EtaResult;
};

const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (value: number): number => (value * Math.PI) / 180;

const haversineDistanceMeters = (from: Coordinate, to: Coordinate): number => {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calculatePolylineLengthMeters = (polyline: Coordinate[]): number => {
  if (polyline.length < 2) {
    return 0;
  }

  let length = 0;

  for (let i = 1; i < polyline.length; i += 1) {
    length += haversineDistanceMeters(polyline[i - 1], polyline[i]);
  }

  return length;
};

const estimateSegmentProgress = (segment: TripRouteSegment, driverCoordinate: Coordinate): number => {
  if (segment.polyline.length === 0) {
    return 0;
  }

  const projectedDistance = Math.min(
    ...segment.polyline.map((point) => haversineDistanceMeters(point, driverCoordinate)),
  );

  const segmentLength = segment.distanceMeters || calculatePolylineLengthMeters(segment.polyline);
  if (segmentLength <= 0) {
    return 0;
  }

  const localProgress = 1 - Math.min(projectedDistance / Math.max(segmentLength * 0.2, 25), 1);
  return Math.max(0, Math.min(localProgress, 1));
};

const estimateRouteProgress = (route: TripRouteModel, driverCoordinate: Coordinate): RouteProgressEstimate => {
  const indexedSegments = route.segments.map((segment) => ({
    segment,
    progress: estimateSegmentProgress(segment, driverCoordinate),
  }));

  const current = indexedSegments.reduce((best, item) =>
    item.progress > best.progress ? item : best,
  );

  const completedDistanceMeters = route.segments.reduce((total, segment) => {
    if (segment.id === current.segment.id) {
      return total + segment.distanceMeters * current.progress;
    }

    if (route.segments.findIndex((candidate) => candidate.id === segment.id) <
      route.segments.findIndex((candidate) => candidate.id === current.segment.id)) {
      return total + segment.distanceMeters;
    }

    return total;
  }, 0);

  const boundedCompletedDistance = Math.max(0, Math.min(completedDistanceMeters, route.totalDistanceMeters));
  const remainingDistanceMeters = Math.max(route.totalDistanceMeters - boundedCompletedDistance, 0);

  return {
    completedDistanceMeters: boundedCompletedDistance,
    remainingDistanceMeters,
    completionRatio: route.totalDistanceMeters > 0 ? boundedCompletedDistance / route.totalDistanceMeters : 0,
    currentSegmentId: current.segment.id,
  };
};

const toKphFromMetersPerSecond = (value: number): number => value * 3.6;

const resolveTelemetryAgeMs = (telemetryObservedAt: string): number =>
  Math.max(0, Date.now() - new Date(telemetryObservedAt).getTime());

export const defaultEtaCalculator: EtaCalculator = {
  calculate: ({
    route,
    driver,
    telemetry,
    staleAfterMs = 20_000,
    trafficMultiplier = 1,
    minimumOperationalSpeedKph = 8,
  }) => {
    const progress = estimateRouteProgress(route, driver.coordinate);
    const telemetryAgeMs = resolveTelemetryAgeMs(telemetry.observedAt);
    const staleTelemetry = telemetryAgeMs > staleAfterMs;

    const derivedSpeedKph = driver.speedKph ?? telemetry.speedKph ??
      toKphFromMetersPerSecond(route.totalDistanceMeters / Math.max(route.totalDurationSeconds, 1));
    const effectiveSpeedKph = Math.max(derivedSpeedKph / Math.max(trafficMultiplier, 0.4), minimumOperationalSpeedKph);

    if (staleTelemetry) {
      return {
        etaSeconds: undefined,
        progress,
        diagnostics: {
          telemetryAgeMs,
          staleTelemetry,
          effectiveSpeedKph,
          fallbackToRouteDuration: false,
        },
      };
    }

    const remainingKm = progress.remainingDistanceMeters / 1000;
    const etaFromSpeedSeconds = Math.round((remainingKm / effectiveSpeedKph) * 3600);
    const fallbackEtaSeconds = Math.round(route.totalDurationSeconds * (1 - progress.completionRatio) * trafficMultiplier);

    const etaSeconds = Number.isFinite(etaFromSpeedSeconds) && etaFromSpeedSeconds > 0
      ? etaFromSpeedSeconds
      : Math.max(fallbackEtaSeconds, 0);

    return {
      etaSeconds,
      progress,
      diagnostics: {
        telemetryAgeMs,
        staleTelemetry,
        effectiveSpeedKph,
        fallbackToRouteDuration: etaSeconds === fallbackEtaSeconds,
        estimatedArrivalAt: new Date(Date.now() + etaSeconds * 1000).toISOString(),
      },
    };
  },
};

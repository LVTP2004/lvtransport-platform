import type { EtaTelemetryPoint } from '../eta/eta-calculator';
import type { TripRouteModel } from '../models/routes';

export type RouteSyncPolicy = {
  recalculateThresholdMeters: number;
  maxSyncIntervalMs: number;
  telemetryStaleAfterMs: number;
};

export type RouteSyncState = {
  lastSyncedAt?: string;
  activeRoute?: TripRouteModel;
  lastTelemetryAt?: string;
  distanceFromRouteMeters?: number;
};

export type RouteSyncDecision = {
  shouldSync: boolean;
  reason:
    | 'no-active-route'
    | 'stale-telemetry'
    | 'sync-interval-elapsed'
    | 'driver-off-route'
    | 'in-sync';
};

const DEFAULT_POLICY: RouteSyncPolicy = {
  recalculateThresholdMeters: 75,
  maxSyncIntervalMs: 30_000,
  telemetryStaleAfterMs: 20_000,
};

export const evaluateRouteSync = (
  state: RouteSyncState,
  telemetry: EtaTelemetryPoint,
  policy: Partial<RouteSyncPolicy> = {},
): RouteSyncDecision => {
  const effectivePolicy = { ...DEFAULT_POLICY, ...policy };

  if (!state.activeRoute) {
    return { shouldSync: true, reason: 'no-active-route' };
  }

  const now = Date.now();
  const observedAt = new Date(telemetry.observedAt).getTime();
  if (now - observedAt > effectivePolicy.telemetryStaleAfterMs) {
    return { shouldSync: false, reason: 'stale-telemetry' };
  }

  const lastSyncedAt = state.lastSyncedAt ? new Date(state.lastSyncedAt).getTime() : 0;
  if (now - lastSyncedAt > effectivePolicy.maxSyncIntervalMs) {
    return { shouldSync: true, reason: 'sync-interval-elapsed' };
  }

  if ((state.distanceFromRouteMeters ?? 0) > effectivePolicy.recalculateThresholdMeters) {
    return { shouldSync: true, reason: 'driver-off-route' };
  }

  return { shouldSync: false, reason: 'in-sync' };
};

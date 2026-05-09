import type { TripRouteModel } from '../models/routes';

export type RouteSyncPolicy = {
  recalculateThresholdMeters: number;
  maxSyncIntervalMs: number;
};

export type RouteSyncState = {
  lastSyncedAt?: string;
  activeRoute?: TripRouteModel;
};

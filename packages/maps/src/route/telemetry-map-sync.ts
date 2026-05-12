import type { EtaTelemetryPoint } from '../eta/eta-calculator';
import type { RouteSyncDecision, RouteSyncState } from './route-sync';
import { evaluateRouteSync } from './route-sync';

export type TelemetryMapSyncResult = {
  decision: RouteSyncDecision;
  nextState: RouteSyncState;
};

export const syncTelemetryToMapState = (
  state: RouteSyncState,
  telemetry: EtaTelemetryPoint,
): TelemetryMapSyncResult => {
  const decision = evaluateRouteSync(state, telemetry);

  return {
    decision,
    nextState: {
      ...state,
      lastTelemetryAt: telemetry.observedAt,
      lastSyncedAt: decision.shouldSync ? new Date().toISOString() : state.lastSyncedAt,
    },
  };
};

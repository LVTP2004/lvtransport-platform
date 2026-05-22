import type { EtaResult } from './eta-calculator';

export type EtaHealthStatus = 'healthy' | 'degraded' | 'stale';

export const getEtaHealthStatus = (eta: EtaResult): EtaHealthStatus => {
  if (eta.diagnostics.staleTelemetry) {
    return 'stale';
  }

  if (!eta.etaSeconds || eta.diagnostics.fallbackToRouteDuration) {
    return 'degraded';
  }

  return 'healthy';
};

export const shouldInvalidateEta = (eta: EtaResult): boolean =>
  eta.diagnostics.staleTelemetry || !Number.isFinite(eta.etaSeconds);

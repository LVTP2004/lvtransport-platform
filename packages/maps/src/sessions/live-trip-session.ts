import type { EtaResult } from '../eta/eta-calculator';

export type LiveTripSessionStatus = 'preparing' | 'active' | 'paused' | 'ended';

export type LiveTripSession = {
  sessionId: string;
  tripId: string;
  driverId: string;
  customerId: string;
  startedAt: string;
  endedAt?: string;
  status: LiveTripSessionStatus;
  eta?: EtaResult;
  lastTelemetryAt?: string;
  routingVersion?: number;
  reconnectToken?: string;
};

export const canCalculateEta = (session: LiveTripSession): boolean =>
  session.status === 'active' && !session.endedAt;

export const restoreEtaState = (
  persisted: Pick<LiveTripSession, 'eta' | 'lastTelemetryAt' | 'routingVersion'>,
): Pick<LiveTripSession, 'eta' | 'lastTelemetryAt' | 'routingVersion'> => ({
  eta: persisted.eta,
  lastTelemetryAt: persisted.lastTelemetryAt,
  routingVersion: persisted.routingVersion,
});

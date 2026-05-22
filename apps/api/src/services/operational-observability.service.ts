import { logger } from '../utils/logger.js';

type LifecycleMutationLog = {
  bookingId: string;
  actor: 'customer' | 'admin' | 'driver' | 'system';
  from: string;
  to: string;
  version: number;
  result: 'applied' | 'rejected' | 'duplicate' | 'stale';
  reason?: string;
  requestId?: string;
};

type RealtimeDiagnosticEvent = {
  type: 'connect' | 'disconnect' | 'reconnect' | 'heartbeat_timeout' | 'replay_requested';
  socketId: string;
  lastSequence?: number | null;
};

const connectionState = new Map<string, { connectedAt: string; disconnectedAt?: string; replayRequests: number }>();
const transitionFailures = new Map<string, number>();

export const operationalObservabilityService = {
  trackLifecycleMutation(entry: LifecycleMutationLog): void {
    if (entry.result === 'rejected' || entry.result === 'stale') {
      const key = `${entry.from}->${entry.to}:${entry.reason ?? 'unknown'}`;
      transitionFailures.set(key, (transitionFailures.get(key) ?? 0) + 1);
    }
    logger.info('lifecycle.mutation', entry);
  },

  trackRealtimeEvent(event: RealtimeDiagnosticEvent): void {
    const now = new Date().toISOString();
    const existing = connectionState.get(event.socketId);
    if (event.type === 'connect' || event.type === 'reconnect') {
      connectionState.set(event.socketId, { connectedAt: now, replayRequests: existing?.replayRequests ?? 0 });
    }
    if (event.type === 'replay_requested') {
      connectionState.set(event.socketId, {
        connectedAt: existing?.connectedAt ?? now,
        disconnectedAt: existing?.disconnectedAt,
        replayRequests: (existing?.replayRequests ?? 0) + 1,
      });
    }
    if (event.type === 'disconnect' || event.type === 'heartbeat_timeout') {
      connectionState.set(event.socketId, {
        connectedAt: existing?.connectedAt ?? now,
        replayRequests: existing?.replayRequests ?? 0,
        disconnectedAt: now,
      });
    }
    logger.info('realtime.diagnostic', event);
  },

  getOperationalSnapshot() {
    const activeConnections = Array.from(connectionState.values()).filter((c) => !c.disconnectedAt).length;
    const reconnectingClients = Array.from(connectionState.values()).filter((c) => c.replayRequests > 0).length;
    return {
      activeConnections,
      reconnectingClients,
      transitionFailureCounters: Object.fromEntries(transitionFailures.entries()),
      observedSockets: connectionState.size,
      generatedAt: new Date().toISOString(),
    };
  },
};

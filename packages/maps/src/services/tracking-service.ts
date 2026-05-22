import type { DriverLiveMarker, RealtimeMapEvent } from '../models/tracking';
import type { RouteSyncState } from '../route/route-sync';

export type TrackingService = {
  startSession(tripId: string): Promise<void>;
  stopSession(tripId: string): Promise<void>;
  reconnectSession(tripId: string): Promise<RouteSyncState | undefined>;
  publishDriverMarker(marker: DriverLiveMarker): Promise<void>;
  subscribe(tripId: string, onEvent: (event: RealtimeMapEvent) => void): () => void;
};

export const createTrackingService = (): TrackingService => {
  const sessionState = new Map<string, RouteSyncState>();

  return {
    startSession: async (tripId) => {
      sessionState.set(tripId, {});
    },
    stopSession: async (tripId) => {
      sessionState.delete(tripId);
    },
    reconnectSession: async (tripId) => sessionState.get(tripId),
    publishDriverMarker: async () => undefined,
    subscribe: () => () => undefined,
  };
};

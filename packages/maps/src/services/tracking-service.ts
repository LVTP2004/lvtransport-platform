import type { DriverLiveMarker, RealtimeMapEvent } from '../models/tracking';

export type TrackingService = {
  startSession(tripId: string): Promise<void>;
  stopSession(tripId: string): Promise<void>;
  publishDriverMarker(marker: DriverLiveMarker): Promise<void>;
  subscribe(tripId: string, onEvent: (event: RealtimeMapEvent) => void): () => void;
};

export const createTrackingService = (): TrackingService => ({
  startSession: async () => undefined,
  stopSession: async () => undefined,
  publishDriverMarker: async () => undefined,
  subscribe: () => () => undefined,
});

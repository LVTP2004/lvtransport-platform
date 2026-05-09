import type { TrackingEventName, TrackingEventPayload } from './tracking.events.js';

export class TrackingService {
  publishEvent(event: TrackingEventName, payload: TrackingEventPayload) {
    // TODO: integrate GPS ingestion pipeline and realtime channel.
    return { event, payload };
  }
}

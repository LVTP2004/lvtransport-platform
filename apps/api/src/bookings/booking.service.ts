import type { BookingEventName, BookingEventPayload } from './booking.events.js';

export class BookingService {
  publishEvent(event: BookingEventName, payload: BookingEventPayload) {
    // TODO: wire into websocket/event bus when realtime dispatch is implemented.
    return { event, payload, publishedAt: new Date().toISOString() };
  }
}

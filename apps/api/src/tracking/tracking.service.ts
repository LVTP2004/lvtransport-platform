import { bookingsService } from '../bookings/bookings.service.js';
import type { TrackingEventPayload } from './tracking.events.js';

const trackingEvents = new Map<string, TrackingEventPayload>();

export const trackingService = {
  findByCode(code: string) {
    return bookingsService.findByTrackingCode(code);
  },

  publishTrackingEvent(payload: TrackingEventPayload) {
    trackingEvents.set(payload.trackingCode, payload);
    return {
      event: 'tracking.created' as const,
      payload,
      occurredAt: new Date().toISOString()
    };
  },

  findTrackingEvent(code: string) {
    return trackingEvents.get(code) ?? null;
  }
};

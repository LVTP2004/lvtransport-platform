import type { TrackingEventName, TrackingEventPayload } from './tracking.events.js';

const trackingStore = new Map<string, TrackingEventPayload>();

const generateTrackingCode = (bookingId: string) => `trk_${bookingId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_${Math.random().toString(36).slice(2, 8)}`;

export class TrackingService {
  createTrackingLink(bookingId: string, customerId: string, driverId?: string) {
    const trackingCode = generateTrackingCode(bookingId);
    const trackingUrl = `/tracking/${trackingCode}`;
    const payload: TrackingEventPayload = {
      bookingId,
      customerId,
      driverId,
      trackingCode,
      trackingUrl,
      timestamp: new Date().toISOString()
    };

    trackingStore.set(trackingCode, payload);
    return payload;
  }

  findByTrackingCode(trackingCode: string) {
    return trackingStore.get(trackingCode) ?? null;
  }

  publishEvent(event: TrackingEventName, payload: TrackingEventPayload) {
    return { event, payload };
  }
}

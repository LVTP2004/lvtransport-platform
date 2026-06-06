import crypto from 'node:crypto';
import type { TrackingEventName, TrackingEventPayload } from './tracking.events.js';

export interface TrackingLink {
  bookingId: string;
  customerId: string;
  trackingCode: string;
  publicUrl: string;
  expiresAt: string;
  createdAt: string;
}

const trackingEvents = new Map<string, TrackingEventPayload>();
const trackingLinks = new Map<string, TrackingLink>();

export class TrackingService {
  createTrackingLink(bookingId: string, customerId: string, driverId?: string) {
    const trackingCode = crypto.randomBytes(5).toString('hex').toUpperCase();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 2);

    const link: TrackingLink = {
      bookingId,
      customerId,
      trackingCode,
      publicUrl: `/tracking/${trackingCode}`,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    const payload: TrackingEventPayload = {
      bookingId,
      customerId,
      driverId,
      trackingCode,
      trackingUrl: link.publicUrl,
      timestamp: link.createdAt
    };

    trackingLinks.set(trackingCode, link);
    trackingEvents.set(trackingCode, payload);

    return link;
  }

  findByTrackingCode(trackingCode: string) {
    return trackingEvents.get(trackingCode.toUpperCase()) ?? null;
  }

  lookupByCode(trackingCode: string) {
    const link = trackingLinks.get(trackingCode.toUpperCase());
    if (!link) return null;
    if (new Date(link.expiresAt).getTime() < Date.now()) return null;
    return link;
  }

  publishEvent(event: TrackingEventName, payload: TrackingEventPayload) {
    return { event, payload, occurredAt: new Date().toISOString() };
  }
}

export const trackingService = new TrackingService();

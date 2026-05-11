import crypto from 'node:crypto';
import type { TrackingEventName, TrackingEventPayload } from './tracking.events.js';

export interface TrackingLink {
  bookingId: string;
  trackingCode: string;
  publicUrl: string;
  customerId: string;
  expiresAt: string;
  createdAt: string;
}

const trackingLinks = new Map<string, TrackingLink>();

export class TrackingService {
  publishEvent(event: TrackingEventName, payload: TrackingEventPayload) {
    return { event, payload, occurredAt: new Date().toISOString() };
  }

  createTrackingLink(bookingId: string, customerId: string) {
    const trackingCode = crypto.randomBytes(5).toString('hex').toUpperCase();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 2);
    const link: TrackingLink = {
      bookingId,
      customerId,
      trackingCode,
      publicUrl: `/tracking/${trackingCode}`,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    trackingLinks.set(trackingCode, link);
    return link;
  }

  lookupByCode(trackingCode: string) {
    const link = trackingLinks.get(trackingCode.toUpperCase());
    if (!link) return null;
    if (new Date(link.expiresAt).getTime() < Date.now()) return null;
    return link;
  }
}

export const trackingService = new TrackingService();

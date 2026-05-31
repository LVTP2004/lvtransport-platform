import { createTrackingCode, normalizeTrackingCode } from '@lvtransport/shared';
import crypto from 'node:crypto';
import type { TrackingEventName, TrackingEventPayload } from './tracking.events.js';

const trackingStore = new Map<string, TrackingEventPayload>();

const generateTrackingCode = (_bookingId: string) => createTrackingCode();
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

    trackingStore.set(normalizeTrackingCode(trackingCode), payload);
    return payload;
  }

  findByTrackingCode(trackingCode: string) {
    return trackingStore.get(normalizeTrackingCode(trackingCode)) ?? null;
  }

  publishEvent(event: TrackingEventName, payload: TrackingEventPayload) {
    return { event, payload };
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
    trackingLinks.set(normalizeTrackingCode(trackingCode), link);
    return link;
  }

  lookupByCode(trackingCode: string) {
    const link = trackingLinks.get(normalizeTrackingCode(trackingCode));
    if (!link) return null;
    if (new Date(link.expiresAt).getTime() < Date.now()) return null;
    return link;
  }
}

export const trackingService = new TrackingService();

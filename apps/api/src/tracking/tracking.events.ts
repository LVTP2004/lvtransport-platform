import { TRACKING_EVENTS } from '../constants/index.js';

export type TrackingEventName = (typeof TRACKING_EVENTS)[keyof typeof TRACKING_EVENTS];

export interface TrackingEventPayload {
  bookingId: string;
  customerId: string;
  trackingCode: string;
  trackingUrl: string;
  driverId?: string;
  coordinates?: { lat: number; lng: number };
  speedKph?: number;
  timestamp: string;
}

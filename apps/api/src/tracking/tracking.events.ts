export type TrackingEventName =
  | 'tracking.created'
  | 'tracking.lookup'
  | 'tracking.expired';

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

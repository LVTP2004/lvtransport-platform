import { eventBus } from '../events/event-bus.js';
import { WS_EVENTS } from '../constants/app.constants.js';

export type TrackingPayload = {
  bookingId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  speedKmh?: number;
  occurredAt: string;
};

export const emitTrackingEvent = (payload: TrackingPayload): void => {
  eventBus.emit(WS_EVENTS.TRACKING_LOCATION_UPDATED, payload);
};
import { TRACKING_EVENTS } from '../constants/index.js';

export type TrackingEventName = (typeof TRACKING_EVENTS)[keyof typeof TRACKING_EVENTS];

export interface TrackingEventPayload {
  tripId: string;
  driverId: string;
  coordinates?: { lat: number; lng: number };
  speedKph?: number;
  timestamp: string;
}

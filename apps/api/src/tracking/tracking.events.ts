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

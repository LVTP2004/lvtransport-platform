import { eventBus } from '../events/event-bus.js';
import { WS_EVENTS } from '../constants/app.constants.js';

export type BookingEventPayload = {
  bookingId: string;
  customerId: string;
  driverId?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  occurredAt: string;
};

export const emitBookingEvent = (payload: BookingEventPayload): void => {
  eventBus.emit(WS_EVENTS.BOOKING_UPDATED, payload);
};
import { BOOKING_EVENTS } from '../constants/index.js';

export type BookingEventName = (typeof BOOKING_EVENTS)[keyof typeof BOOKING_EVENTS];

export interface BookingEventPayload {
  bookingId: string;
  customerId?: string;
  driverId?: string;
  metadata?: Record<string, unknown>;
}

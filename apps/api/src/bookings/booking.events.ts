import { eventBus } from '../events/event-bus.js';
import { BOOKING_EVENTS } from '../constants/index.js';

export type BookingEventName = (typeof BOOKING_EVENTS)[keyof typeof BOOKING_EVENTS];

export type BookingEventPayload = {
  bookingId: string;
  customerId: string;
  driverId?: string;
  status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  occurredAt?: string;
  metadata?: Record<string, unknown>;
};

export const emitBookingEvent = (payload: BookingEventPayload): void => {
  eventBus.emit(BOOKING_EVENTS.CREATED, payload);
};

import { eventBus } from '../events/event-bus.js';
import { BOOKING_EVENTS } from '../constants/index.js';

export type BookingEventName = (typeof BOOKING_EVENTS)[keyof typeof BOOKING_EVENTS];

export type BookingEventPayload = {
  bookingId: string;
  customerId: string;
  driverId?: string;
  status?: 'pending' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  occurredAt?: string;
  eventId?: string;
  metadata?: Record<string, unknown>;
};

export const emitBookingEvent = (payload: BookingEventPayload): void => {
  const eventName =
    payload.status === 'assigned'
      ? BOOKING_EVENTS.ASSIGNED
      : payload.status === 'cancelled'
        ? BOOKING_EVENTS.CANCELLED
        : BOOKING_EVENTS.CREATED;
  eventBus.emit(eventName, payload);
};

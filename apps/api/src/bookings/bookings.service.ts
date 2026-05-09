import { emitBookingEvent, type BookingEventPayload } from './booking.events.js';

export const bookingsService = {
  publishBookingState(payload: BookingEventPayload): void {
    emitBookingEvent(payload);
  },
};

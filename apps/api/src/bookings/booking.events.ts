import { eventBus } from '../events/event-bus.js';

export type BookingEventPayload = {
  bookingId: string;
  customerId: string;
  driverId?: string;
  status:
    | 'pending'
    | 'assigned'
    | 'accepted'
    | 'en_route'
    | 'arrived'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

  occurredAt?: string;
  eventId?: string;
  metadata?: Record<string, unknown>;
};

export const BOOKING_UPDATED_EVENT = 'booking.updated';

export function emitBookingEvent(
  payload: BookingEventPayload
): void {
  eventBus.emit(BOOKING_UPDATED_EVENT, payload);
}

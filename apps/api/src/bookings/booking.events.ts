import { eventBus } from '../events/event-bus.js';

export type DispatchBookingStatus =
  | 'pending'
  | 'assigned'
  | 'driver_accepted'
  | 'driver_rejected'
  | 'driver_arriving'
  | 'passenger_onboard'
  | 'completed'
  | 'cancelled';

export interface BookingEventPayload {
  bookingId: string;
  customerId: string;
  driverId?: string;
  status: DispatchBookingStatus;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export const BOOKING_UPDATED_EVENT = 'booking.updated' as const;

export const emitBookingEvent = (payload: BookingEventPayload): void => {
  eventBus.emit(BOOKING_UPDATED_EVENT, payload);
};

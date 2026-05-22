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
import { BOOKING_EVENTS } from '../constants/index.js';
import { WS_EVENTS } from '../constants/app.constants.js';
import { eventBus } from '../events/event-bus.js';

export type BookingEventName = (typeof BOOKING_EVENTS)[keyof typeof BOOKING_EVENTS];

export interface BookingEventPayload {
  bookingId: string;
  customerId?: string;
  driverId?: string;
  status?: 'pending' | 'accepted' | 'assigned' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  occurredAt?: string;
  eventId?: string;
  metadata?: Record<string, unknown>;
}

export const emitBookingEvent = (payload: BookingEventPayload): void => {
  eventBus.emit(WS_EVENTS.BOOKING_UPDATED, payload);
};

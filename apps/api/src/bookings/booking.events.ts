import { BOOKING_EVENTS } from '../constants/index.js';

export type BookingEventName = (typeof BOOKING_EVENTS)[keyof typeof BOOKING_EVENTS];

export interface BookingEventPayload {
  bookingId: string;
  customerId?: string;
  driverId?: string;
  metadata?: Record<string, unknown>;
}

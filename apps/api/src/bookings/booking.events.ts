import { BOOKING_EVENTS } from '../constants/index.js';

export type BookingEventName = (typeof BOOKING_EVENTS)[keyof typeof BOOKING_EVENTS] | 'booking.status.updated';

export interface BookingEventPayload {
  bookingId: string;
  customerId: string;
  driverId?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  trackingCode?: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
}

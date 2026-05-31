import { WS_EVENTS } from '../constants/app.constants.js';
import { eventBus } from '../events/event-bus.js';
import type { BookingLifecycleStatus, BookingTimelineEntry } from '@lvtransport/realtime';

export type BookingEventName =
  | 'booking.created'
  | 'booking.updated'
  | 'booking.status.updated'
  | 'booking.driver.assigned';

export interface BookingEventPayload {
  bookingId: string;
  bookingCode?: string;
  customerId: string;
  driverId?: string;
  status: BookingLifecycleStatus;
  timelineEntry?: BookingTimelineEntry;
  trackingCode?: string;
  occurredAt?: string;
  eventId?: string;
  metadata?: Record<string, unknown>;
}

export const BOOKING_UPDATED_EVENT = 'booking.updated' as const;

export const emitBookingEvent = (payload: BookingEventPayload): void => {
  eventBus.emit(WS_EVENTS.BOOKING_UPDATED, payload);
  eventBus.emit(BOOKING_UPDATED_EVENT, payload);
};

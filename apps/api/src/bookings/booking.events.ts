import { BOOKING_EVENTS } from '../constants/index.js';
import type { BookingLifecycleStatus, BookingTimelineEntry } from '@lvtransport/realtime';

export type BookingEventName = (typeof BOOKING_EVENTS)[keyof typeof BOOKING_EVENTS];

export interface BookingEventPayload {
  bookingId: string;
  bookingCode: string;
  customerId: string;
  driverId?: string;
  status: BookingLifecycleStatus;
  timelineEntry: BookingTimelineEntry;
  metadata?: Record<string, unknown>;
}

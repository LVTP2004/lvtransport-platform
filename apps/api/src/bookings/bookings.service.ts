import { eventBus } from '../events/event-bus.js';
import { WS_EVENTS } from '../constants/app.constants.js';
import type { BookingRecord, BookingTimelineEntry } from '@lvtransport/realtime';

export const emitBookingEvent = (booking: BookingRecord, timelineEntry: BookingTimelineEntry): void => {
  eventBus.emit(WS_EVENTS.BOOKING_UPDATED, { booking, timelineEntry });
};

import { CANONICAL_ALLOWED_TRANSITIONS, TERMINAL_BOOKING_STATUSES, toCanonicalBookingStatus } from '../types/lifecycle.js';
import { emitBookingEvent, type BookingEventPayload } from './booking.events.js';

type BookingStatus = NonNullable<BookingEventPayload['status']>;

type BookingRecord = {
  bookingId: string;
  customerId: string;
  driverId?: string;
  status: BookingStatus;
  updatedAt: string;
  history: BookingEventPayload[];
};

const bookingStore = new Map<string, BookingRecord>();
const processedEventIds = new Set<string>();

export const bookingsService = {
  publishBookingState(payload: BookingEventPayload): BookingRecord {
    const status = toCanonicalBookingStatus(payload.status) as BookingStatus;
    const eventId = payload.eventId ?? `${payload.bookingId}:${status}:${payload.occurredAt ?? ''}`;

    if (processedEventIds.has(eventId)) {
      const existing = bookingStore.get(payload.bookingId);
      if (existing) return existing;
    }

    const now = payload.occurredAt ?? new Date().toISOString();
    const existing = bookingStore.get(payload.bookingId);

    if (existing) {
      if (TERMINAL_BOOKING_STATUSES.has(existing.status as any)) {
        return existing;
      }

      if (!CANONICAL_ALLOWED_TRANSITIONS[existing.status].has(status as any)) {
        return existing;
      }
    }

    const next: BookingRecord = {
      bookingId: payload.bookingId,
      customerId: payload.customerId ?? existing?.customerId ?? 'unknown',
      driverId: payload.driverId ?? existing?.driverId,
      status,
      updatedAt: now,
      history: [...(existing?.history ?? []), { ...payload, status, occurredAt: now, eventId }],
    };

    bookingStore.set(payload.bookingId, next);
    processedEventIds.add(eventId);
    emitBookingEvent({ ...payload, status, occurredAt: now, eventId });
    return next;
  },
};

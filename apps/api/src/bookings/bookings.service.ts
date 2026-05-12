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

const terminalStatuses: ReadonlySet<BookingStatus> = new Set(['completed', 'cancelled']);

const allowedTransitions: Record<BookingStatus, ReadonlySet<BookingStatus>> = {
  pending: new Set(['assigned', 'cancelled']),
  assigned: new Set(['accepted', 'cancelled']),
  accepted: new Set(['in_progress', 'cancelled']),
  in_progress: new Set(['completed', 'cancelled']),
  completed: new Set(),
  cancelled: new Set(),
  onderweg: new Set(['arrived', 'cancelled']),
  arrived: new Set(['in_progress', 'cancelled']),
};

const bookingStore = new Map<string, BookingRecord>();
const processedEventIds = new Set<string>();

export const bookingsService = {
  publishBookingState(payload: BookingEventPayload): BookingRecord {
    const status: BookingStatus = payload.status ?? 'pending';
    const eventId = payload.eventId ?? `${payload.bookingId}:${status}:${payload.occurredAt ?? ''}`;

    if (processedEventIds.has(eventId)) {
      const existing = bookingStore.get(payload.bookingId);
      if (existing) return existing;
    }

    const now = payload.occurredAt ?? new Date().toISOString();
    const existing = bookingStore.get(payload.bookingId);

    if (existing) {
      if (terminalStatuses.has(existing.status)) {
        return existing;
      }

      if (!allowedTransitions[existing.status].has(status)) {
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

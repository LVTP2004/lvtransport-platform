import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
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
};

const PERSISTENCE_PATH = resolve(process.cwd(), '.data/bookings-store.json');

const bookingStore = new Map<string, BookingRecord>();
const processedEventIds = new Set<string>();

const persistStore = (): void => {
  mkdirSync(dirname(PERSISTENCE_PATH), { recursive: true });
  const payload = {
    bookings: Array.from(bookingStore.values()),
    processedEventIds: Array.from(processedEventIds.values()),
  };
  writeFileSync(PERSISTENCE_PATH, JSON.stringify(payload, null, 2), 'utf8');
};

const hydrateStore = (): void => {
  try {
    const raw = readFileSync(PERSISTENCE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as { bookings?: BookingRecord[]; processedEventIds?: string[] };

    for (const booking of parsed.bookings ?? []) {
      bookingStore.set(booking.bookingId, booking);
      for (const event of booking.history ?? []) {
        if (event.eventId) {
          processedEventIds.add(event.eventId);
        }
      }
    }

    for (const eventId of parsed.processedEventIds ?? []) {
      processedEventIds.add(eventId);
    }
  } catch {
    // No persisted bookings yet, continue with in-memory store.
  }
};

hydrateStore();

export const bookingsService = {
  publishBookingState(payload: BookingEventPayload): BookingRecord {
    const status: BookingStatus = payload.status ?? 'pending';
    const now = payload.occurredAt ?? new Date().toISOString();
    const eventId = payload.eventId ?? `${payload.bookingId}:${status}:${now}`;

    if (processedEventIds.has(eventId)) {
      const existing = bookingStore.get(payload.bookingId);
      if (existing) return existing;
    }

    const existing = bookingStore.get(payload.bookingId);

    if (!existing && status !== 'pending') {
      throw new Error(`Booking ${payload.bookingId} must start at pending status.`);
    }

    if (existing?.customerId !== undefined && existing.customerId !== payload.customerId) {
      throw new Error(`Booking ${payload.bookingId} is already owned by a different customer.`);
    }

    const activeCustomerBooking = Array.from(bookingStore.values()).find(
      (record) => record.customerId === payload.customerId && !terminalStatuses.has(record.status) && record.bookingId !== payload.bookingId,
    );

    if (!existing && status === 'pending' && activeCustomerBooking) {
      return activeCustomerBooking;
    }

    if (existing) {
      if (terminalStatuses.has(existing.status)) {
        return existing;
      }

      if (status !== existing.status && !allowedTransitions[existing.status].has(status)) {
        return existing;
      }
    }

    const next: BookingRecord = {
      bookingId: payload.bookingId,
      customerId: payload.customerId,
      driverId: payload.driverId ?? existing?.driverId,
      status,
      updatedAt: now,
      history: [...(existing?.history ?? []), { ...payload, status, occurredAt: now, eventId }],
    };

    bookingStore.set(payload.bookingId, next);
    processedEventIds.add(eventId);
    persistStore();
    emitBookingEvent({ ...payload, status, occurredAt: now, eventId });
    return next;
  },

  getBooking(bookingId: string): BookingRecord | undefined {
    return bookingStore.get(bookingId);
  },

  getCustomerActiveBooking(customerId: string): BookingRecord | undefined {
    return Array.from(bookingStore.values()).find((booking) => booking.customerId === customerId && !terminalStatuses.has(booking.status));
  },

  listBookings(): BookingRecord[] {
    return Array.from(bookingStore.values());
  },
};

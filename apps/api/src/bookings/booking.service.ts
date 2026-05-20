import { randomUUID } from 'node:crypto';
import type { BookingLifecycleStatus, BookingRecord } from '@lvtransport/realtime';
import { BOOKING_STATUS_TRANSITIONS, canTransitionBookingStatus, makeTimelineEntry } from '@lvtransport/realtime';
import { emitBookingEvent } from './bookings.service.js';

const bookingStore = new Map<string, BookingRecord>();

const makeBookingCode = () => `LV-${Math.floor(100000 + Math.random() * 900000)}`;

export class BookingService {
  createBooking(input: { customerId: string; pickup: string; destination: string }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    const timeline = [makeTimelineEntry('pending', 'customer', now)];
    const booking: BookingRecord = {
      id,
      bookingCode: makeBookingCode(),
      customerId: input.customerId,
      pickup: input.pickup,
      destination: input.destination,
      status: 'pending',
      driverId: undefined,
      timeline,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    bookingStore.set(id, booking);
    emitBookingEvent(booking, timeline[0]);
    return booking;
  }

  listBookings() { return [...bookingStore.values()]; }

  updateStatus(bookingId: string, nextStatus: BookingLifecycleStatus, actor: 'admin' | 'driver' | 'system', expectedVersion?: number) {
    const booking = bookingStore.get(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (expectedVersion && expectedVersion !== booking.version) throw new Error('Version conflict');
    if (!canTransitionBookingStatus(booking.status, nextStatus)) throw new Error(`Invalid transition ${booking.status} -> ${nextStatus}`);
    const now = new Date().toISOString();
    const entry = makeTimelineEntry(nextStatus, actor, now);
    booking.status = nextStatus;
    booking.updatedAt = now;
    booking.version += 1;
    booking.timeline.push(entry);
    bookingStore.set(bookingId, booking);
    emitBookingEvent(booking, entry);
    return booking;
  }

  assignDriver(bookingId: string, driverId: string, expectedVersion?: number) {
    const booking = this.updateStatus(bookingId, 'assigned', 'admin', expectedVersion);
    booking.driverId = driverId;
    bookingStore.set(bookingId, booking);
    return booking;
  }

  allowedTransitions(status: BookingLifecycleStatus) {
    return BOOKING_STATUS_TRANSITIONS[status];
  }
}

import { randomUUID } from 'node:crypto';
import { createTrackingCode } from '@lvtransport/shared';
import type { BookingLifecycleStatus, BookingRecord } from '@lvtransport/realtime';
import { BOOKING_STATUS_TRANSITIONS, canTransitionBookingStatus, makeTimelineEntry } from '@lvtransport/realtime';
import { emitBookingEvent } from './bookings.service.js';
import { NotificationService } from '../notifications/notification.service.js';
import { TrackingService } from '../tracking/tracking.service.js';

const bookingStore = new Map<string, BookingRecord>();
const TRACKING_BASE_PATH = '/track';

const makeBookingCode = () => `LV-${Math.floor(100000 + Math.random() * 900000)}`;

const notificationService = new NotificationService();
const trackingService = new TrackingService();

export class BookingService {
  constructor(private readonly notifications: NotificationService = notificationService) {}

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
      updatedAt: now
    };

    bookingStore.set(id, booking);
    emitBookingEvent(booking, timeline[0]);

    return booking;
  }

  listBookings() {
    return [...bookingStore.values()];
  }

  updateStatus(
    bookingId: string,
    nextStatus: BookingLifecycleStatus,
    actor: 'admin' | 'driver' | 'system',
    expectedVersion?: number
  ) {
    const booking = bookingStore.get(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (expectedVersion && expectedVersion !== booking.version) {
      throw new Error('Version conflict');
    }

    if (!canTransitionBookingStatus(booking.status, nextStatus)) {
      throw new Error(`Invalid transition ${booking.status} -> ${nextStatus}`);
    }

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

  publishEvent(event: string, payload: Record<string, unknown>) {
    const enrichedPayload = {
      ...payload,
      occurredAt: new Date().toISOString()
    };

    return {
      event,
      payload: enrichedPayload,
      publishedAt: enrichedPayload.occurredAt
    };
  }

  generateCustomerTrackingLink(bookingId: string, customerId: string, baseUrl: string) {
    const trackingCode = this.generateTrackingCode();
    const path = `${TRACKING_BASE_PATH}/${trackingCode}`;

    return {
      bookingId,
      customerId,
      trackingCode,
      path,
      link: `${baseUrl}${path}`
    };
  }

  prepareNotificationFlow(input: {
    bookingId: string;
    customerId: string;
    adminId: string;
    status: 'pending' | 'accepted' | 'assigned' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
    driverId?: string;
    trackingLink?: string;
  }) {
    const messages = [
      this.notifications.queue({
        bookingId: input.bookingId,
        recipientId: input.customerId,
        audience: 'customer',
        channel: 'email',
        eventType: 'booking.confirmation',
        title: 'Booking confirmed',
        body: `Your booking ${input.bookingId} is confirmed.${input.trackingLink ? ` Track: ${input.trackingLink}` : ''}`,
        data: { status: input.status }
      }),
      this.notifications.queue({
        bookingId: input.bookingId,
        recipientId: input.adminId,
        audience: 'admin',
        channel: 'push',
        eventType: 'admin.booking.created',
        title: 'New booking request',
        body: `Booking ${input.bookingId} requires dispatch visibility.`,
        data: { status: input.status }
      }),
      this.notifications.queue({
        bookingId: input.bookingId,
        recipientId: input.customerId,
        audience: 'customer',
        channel: 'push',
        eventType: 'booking.status.updated',
        title: 'Booking status updated',
        body: `Booking ${input.bookingId} is now ${input.status.replace('_', ' ')}.`,
        data: { status: input.status }
      })
    ];

    if (input.driverId) {
      messages.push(
        this.notifications.queue({
          bookingId: input.bookingId,
          recipientId: input.driverId,
          audience: 'driver',
          channel: 'push',
          eventType: 'booking.driver.assigned',
          title: 'New booking assigned',
          body: `You have been assigned booking ${input.bookingId}.`,
          data: { status: input.status }
        })
      );
    }

    return {
      notifications: messages,
      deliveryLog: this.notifications.getDeliveryLog()
    };
  }

  preparePublicTrackingLookup(code: string, known: Array<{ bookingId: string; code: string; status: string }>) {
    const match = known.find((item) => item.code === code);

    if (!match) {
      return { found: false, code, error: 'Tracking code not found.' };
    }

    return {
      found: true,
      code,
      bookingId: match.bookingId,
      status: match.status,
      route: `${TRACKING_BASE_PATH}/${code}`
    };
  }

  getTrackingByCode(code: string) {
    return trackingService.findByTrackingCode(code);
  }

  private generateTrackingCode() {
    return createTrackingCode();
  }
}

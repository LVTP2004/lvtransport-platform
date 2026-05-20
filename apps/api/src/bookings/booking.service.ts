import { randomBytes } from 'node:crypto';
import type { BookingEventName, BookingEventPayload } from './booking.events.js';
import { NotificationService } from '../notifications/notification.service.js';

const TRACKING_BASE_PATH = '/track';

export class BookingService {
  constructor(private readonly notificationService: NotificationService = new NotificationService()) {}

  publishEvent(event: BookingEventName, payload: BookingEventPayload) {
    const enrichedPayload = {
      ...payload,
      occurredAt: new Date().toISOString()
    };

    return { event, payload: enrichedPayload, publishedAt: enrichedPayload.occurredAt };
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
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    driverId?: string;
    trackingLink?: string;
  }) {
    const messages = [
      this.notificationService.queue({
        bookingId: input.bookingId,
        recipientId: input.customerId,
        audience: 'customer',
        channel: 'email',
        eventType: 'booking.confirmation',
        title: 'Booking confirmed',
        body: `Your booking ${input.bookingId} is confirmed.${input.trackingLink ? ` Track: ${input.trackingLink}` : ''}`,
        data: { status: input.status }
      }),
      this.notificationService.queue({
        bookingId: input.bookingId,
        recipientId: input.adminId,
        audience: 'admin',
        channel: 'in_app',
        eventType: 'admin.booking.created',
        title: 'New booking request',
        body: `Booking ${input.bookingId} requires dispatch visibility.`,
        data: { status: input.status }
      }),
      this.notificationService.queue({
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
        this.notificationService.queue({
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
      deliveryLog: this.notificationService.getDeliveryLog()
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

  private generateTrackingCode() {
    return randomBytes(5).toString('hex').toUpperCase();
  }
}

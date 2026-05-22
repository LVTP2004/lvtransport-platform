import { randomBytes } from 'node:crypto';
import type { BookingEventName, BookingEventPayload } from './booking.events.js';
import { NotificationService } from '../notifications/notification.service.js';

const TRACKING_BASE_PATH = '/track';
import { TrackingService } from '../tracking/tracking.service.js';

const notificationService = new NotificationService();
const trackingService = new TrackingService();

const emailTemplates = {
  booking_confirmation: 'Booking {{bookingId}} confirmed. Track: {{trackingUrl}}',
  booking_status_update: 'Booking {{bookingId}} is now {{status}}.',
  driver_assigned: 'Driver {{driverId}} assigned to booking {{bookingId}}.',
  admin_new_booking_alert: 'New booking {{bookingId}} created by customer {{customerId}}.'
} as const;

const whatsappTemplates = {
  booking_confirmation: 'Your LV Transport booking {{bookingId}} is confirmed. Track: {{trackingUrl}}',
  booking_status_update: 'Booking {{bookingId}} updated to {{status}}',
  driver_assigned: 'Driver assigned for booking {{bookingId}}: {{driverId}}',
  admin_new_booking_alert: 'New booking created: {{bookingId}}'
} as const;

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
    const tracking = trackingService.createTrackingLink(payload.bookingId, payload.customerId, payload.driverId);

    const customerConfirmation = notificationService.queue({
      notificationId: `${payload.bookingId}-customer-confirmation`,
      recipientId: payload.customerId,
      audience: 'customer',
      channel: 'email',
      template: 'booking_confirmation',
      title: 'Booking confirmed',
      body: this.renderTemplate(emailTemplates.booking_confirmation, { ...payload, ...tracking }),
      data: { trackingCode: tracking.trackingCode, trackingUrl: tracking.trackingUrl },
      occurredAt: payload.occurredAt
    });

    const statusUpdate = notificationService.queue({
      notificationId: `${payload.bookingId}-customer-status`,
      recipientId: payload.customerId,
      audience: 'customer',
      channel: 'whatsapp',
      template: 'booking_status_update',
      title: 'Booking status update',
      body: this.renderTemplate(whatsappTemplates.booking_status_update, payload),
      data: { status: payload.status },
      occurredAt: payload.occurredAt
    });

    const assignment = payload.driverId
      ? notificationService.queue({
          notificationId: `${payload.bookingId}-driver-assigned`,
          recipientId: payload.driverId,
          audience: 'driver',
          channel: 'in_app',
          template: 'driver_assigned',
          title: 'New ride assigned',
          body: this.renderTemplate(emailTemplates.driver_assigned, payload),
          data: { bookingId: payload.bookingId },
          occurredAt: payload.occurredAt
        })
      : null;

    const adminAlert = notificationService.queue({
      notificationId: `${payload.bookingId}-admin-alert`,
      recipientId: 'admin-dispatch',
      audience: 'admin',
      channel: 'in_app',
      template: 'admin_new_booking_alert',
      title: 'New booking alert',
      body: this.renderTemplate(emailTemplates.admin_new_booking_alert, payload),
      data: { bookingId: payload.bookingId, status: payload.status },
      occurredAt: payload.occurredAt
    });

    return { event, payload, tracking, notifications: { customerConfirmation, statusUpdate, assignment, adminAlert }, deliveryLog: notificationService.getDeliveryLog(), publishedAt: new Date().toISOString() };
  }

  getTrackingByCode(code: string) {
    return trackingService.findByTrackingCode(code);
  }

  private renderTemplate(template: string, values: Record<string, unknown>) {
    return template.replace(/{{(.*?)}}/g, (_, key) => String(values[key.trim()] ?? ''));
  }
}

import type { BookingEventName, BookingEventPayload } from './booking.events.js';
import { NotificationService } from '../notifications/notification.service.js';
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
  publishEvent(event: BookingEventName, payload: BookingEventPayload) {
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

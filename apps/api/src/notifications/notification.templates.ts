import type { NotificationTemplate } from './notification.types.js';

export const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'booking-confirmation-email-v1',
    type: 'booking_confirmation',
    channel: 'email',
    subject: 'Your LV Transport booking is confirmed',
    bodyText: 'Booking {{bookingReference}} confirmed for {{pickupTime}}.',
    bodyHtml: '<p>Booking <strong>{{bookingReference}}</strong> confirmed for {{pickupTime}}.</p>',
    placeholders: ['bookingReference', 'pickupTime', 'customerName'],
    enabled: true,
    version: 1
  },
  {
    id: 'driver-assignment-push-v1',
    type: 'driver_assignment',
    channel: 'push',
    bodyText: 'Driver {{driverName}} is assigned for booking {{bookingReference}}.',
    placeholders: ['driverName', 'bookingReference', 'vehicleLabel'],
    enabled: true,
    version: 1
  }
];

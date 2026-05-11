import { NotificationService, buildEmailTemplate, buildTrackingCode, buildTrackingUrl, buildWhatsAppTemplate } from '../notifications/notification.service.js';
import type { BookingNotificationContext } from '../notifications/notification.types.js';

const notificationService = new NotificationService();

export const notificationOrchestrator = {
  createBookingConfirmation(input: Omit<BookingNotificationContext, 'trackingCode' | 'trackingUrl'>) {
    const trackingCode = buildTrackingCode(input.bookingId);
    const trackingUrl = buildTrackingUrl(trackingCode);
    const context: BookingNotificationContext = { ...input, trackingCode, trackingUrl };

    const customerNotification = notificationService.queue({
      recipientId: context.customerId,
      audience: 'customer',
      channel: 'email',
      title: 'Your booking is confirmed',
      body: `Track your ride at ${trackingUrl}`,
      template: 'booking_confirmation',
      templateData: context,
    });

    const adminAlert = notificationService.queue({
      recipientId: 'admin_dispatch',
      audience: 'admin',
      channel: 'in_app',
      title: 'New booking received',
      body: `Booking ${context.bookingId} from ${context.pickup} to ${context.dropoff}`,
      template: 'admin_new_booking_alert',
      templateData: context,
    });

    return {
      trackingCode,
      trackingUrl,
      customerNotification,
      adminAlert,
      emailTemplate: buildEmailTemplate('booking_confirmation', context),
      whatsappTemplate: buildWhatsAppTemplate('booking_confirmation', context),
    };
  },

  createDriverAssigned(context: BookingNotificationContext) {
    return notificationService.queue({
      recipientId: context.customerId,
      audience: 'customer',
      channel: 'in_app',
      title: 'Driver assigned',
      body: `${context.driverName ?? 'Your driver'} is heading to pickup.`,
      template: 'driver_assigned',
      templateData: context,
    });
  },

  createBookingStatusUpdate(context: BookingNotificationContext) {
    return notificationService.queue({
      recipientId: context.customerId,
      audience: 'customer',
      channel: 'in_app',
      title: `Booking ${context.status}`,
      body: `Status changed to ${context.status}. Track: ${context.trackingUrl}`,
      template: 'booking_status_update',
      templateData: context,
    });
  },

  lookupTrackingCode(code: string) {
    return notificationService
      .getDeliveryLogs()
      .find((log) => log.notificationId.startsWith(code.slice(0, 6))) ?? null;
  },

  getDeliveryLogs() {
    return notificationService.getDeliveryLogs();
  },
};

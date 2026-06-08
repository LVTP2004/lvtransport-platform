import { notificationService } from '../notifications/notification.service.js';


type OrchestratorContext = {
  bookingId: string;
  customerId: string;
  adminId?: string;
  status?: string;
  driverId?: string;
  [key: string]: unknown;
};

export const notificationOrchestrator = {
  createBookingConfirmation(input: OrchestratorContext) {
    const trackingCode = input.bookingId.slice(0, 8).toUpperCase();
    const trackingUrl = `https://track.lvtransport.local/${trackingCode}`;

    const customerNotification = notificationService.queue({
      recipientId: input.customerId,
      audience: 'customer',
      type: 'booking_confirmation',
      channels: ['email'],
      title: 'Your booking is confirmed',
      body: `Track your ride at ${trackingUrl}`,
      data: input as Record<string, unknown>,
    });

    const adminAlert = notificationService.queue({
      recipientId: (input.adminId as string) ?? 'admin_dispatch',
      audience: 'admin',
      type: 'admin_alert',
      channels: ['in_app'],
      title: 'New booking received',
      body: `Booking ${input.bookingId} received`,
      data: input as Record<string, unknown>,
    });

    return { trackingCode, trackingUrl, customerNotification, adminAlert };
  },

  createDriverAssigned(context: OrchestratorContext) {
    return notificationService.queue({
      recipientId: context.customerId,
      audience: 'customer',
      type: 'driver_assignment',
      channels: ['in_app'],
      title: 'Driver assigned',
      body: `Driver assigned for booking ${context.bookingId}.`,
      data: context as Record<string, unknown>,
    });
  },

  createBookingStatusUpdate(context: OrchestratorContext) {
    return notificationService.queue({
      recipientId: context.customerId,
      audience: 'customer',
      type: 'booking_status_update',
      channels: ['in_app'],
      title: `Booking ${context.status ?? 'updated'}`,
      body: `Status changed to ${context.status ?? 'updated'}.`,
      data: context as Record<string, unknown>,
    });
  },

  lookupTrackingCode(code: string) {
    return notificationService
      .getDeliveryLogs()
      .find((log: { notificationId: string }) => log.notificationId.startsWith(code.slice(0, 6))) ?? null;
  },

  getDeliveryLogs() {
    return notificationService.getDeliveryLogs();
  },
};

import { notificationService } from '../notifications/notification.service.js';

export type BookingStatus = 'pending' | 'confirmed' | 'driver_assigned' | 'en_route' | 'completed' | 'cancelled';

export interface BookingNotificationContext {
  bookingId: string;
  customerId: string;
  customerEmail: string;
  customerPhone?: string;
  driverId?: string;
  driverPhone?: string;
  adminId: string;
  status: BookingStatus;
}

export const bookingNotificationFlowService = {
  onBookingConfirmed(context: BookingNotificationContext) {
    return notificationService.queue({
      bookingId: context.bookingId,
      recipientId: context.customerId,
      audience: 'customer',
      type: 'booking_confirmation',
      channels: ['email', 'in_app', 'push'],
      title: 'Booking confirmed',
      body: `Your ride is confirmed for booking ${context.bookingId}.`,
      data: { bookingStatus: 'confirmed' },
    });
  },

  onBookingStatusUpdated(context: BookingNotificationContext) {
    return notificationService.queue({
      bookingId: context.bookingId,
      recipientId: context.customerId,
      audience: 'customer',
      type: 'booking_status_update',
      channels: ['in_app', 'push', 'email'],
      title: 'Booking status updated',
      body: `Booking ${context.bookingId} is now ${context.status}.`,
      data: { bookingStatus: context.status },
    });
  },

  onDriverAssigned(context: BookingNotificationContext) {
    if (!context.driverId) {
      return { customerResult: null, driverResult: null, adminResult: null };
    }

    const dispatch = notificationService.createDriverAssignmentDispatchNotification({
      bookingId: context.bookingId,
      customerId: context.customerId,
      driverId: context.driverId,
      adminId: context.adminId,
    });

    return {
      customerResult: dispatch.customer,
      driverResult: dispatch.driver,
      adminResult: dispatch.admin,
    };
  },

  onAdminNewBookingAlert(context: BookingNotificationContext) {
    return notificationService.queue({
      bookingId: context.bookingId,
      recipientId: context.adminId,
      audience: 'admin',
      type: 'admin_alert',
      channels: ['in_app', 'push'],
      title: 'Dispatch alert',
      body: `Booking ${context.bookingId} requires dispatch review.`,
      data: { bookingStatus: context.status, dedupeKey: `${context.bookingId}:admin_alert` },
    });
  },

  onReconnectRestore(recipientId: string, checkpoint?: string) {
    return notificationService.restoreActiveNotifications(recipientId, checkpoint);
  },

  onRideCompleted(context: BookingNotificationContext) {
    notificationService.archiveOperationalAlertsForBooking(context.bookingId);
    return notificationService.queue({
      bookingId: context.bookingId,
      recipientId: context.customerId,
      audience: 'customer',
      type: 'booking_status_update',
      channels: ['in_app', 'push'],
      title: 'Ride completed',
      body: `Ride ${context.bookingId} is completed. Thank you for riding with LV Transport.`,
      data: { bookingStatus: 'completed' },
    });
  },
};

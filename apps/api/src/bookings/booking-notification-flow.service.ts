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
      channels: ['email', 'in_app'],
      title: 'Booking confirmed',
      body: `Your ride is confirmed for booking ${context.bookingId}.`,
    });
  },

  onBookingStatusUpdated(context: BookingNotificationContext) {
    return notificationService.queue({
      bookingId: context.bookingId,
      recipientId: context.customerId,
      audience: 'customer',
      type: 'booking_status_update',
      channels: ['in_app', 'email'],
      title: 'Booking status updated',
      body: `Booking ${context.bookingId} is now ${context.status}.`,
    });
  },

  onDriverAssigned(context: BookingNotificationContext) {
    const customerResult = notificationService.queue({
      bookingId: context.bookingId,
      recipientId: context.customerId,
      audience: 'customer',
      type: 'driver_assignment',
      channels: ['in_app', 'email'],
      title: 'Driver assigned',
      body: `A driver has been assigned to booking ${context.bookingId}.`,
    });

    const driverResult = context.driverId
      ? notificationService.queue({
          bookingId: context.bookingId,
          recipientId: context.driverId,
          audience: 'driver',
          type: 'driver_assignment',
          channels: ['push', 'in_app'],
          title: 'New trip assignment',
          body: `You have been assigned to booking ${context.bookingId}.`,
        })
      : null;

    return { customerResult, driverResult };
  },

  onAdminNewBookingAlert(context: BookingNotificationContext) {
    return notificationService.createOperationalWarning(
      context.adminId,
      context.bookingId,
      `Booking ${context.bookingId} requires dispatch review.`,
      'admin_alert',
    );
  },

  onRideCompleted(context: BookingNotificationContext) {
    notificationService.archiveOperationalAlertsForBooking(context.bookingId);
    return notificationService.queue({
      bookingId: context.bookingId,
      recipientId: context.customerId,
      audience: 'customer',
      type: 'booking_status_update',
      channels: ['in_app'],
      title: 'Ride completed',
      body: `Ride ${context.bookingId} is completed. Thank you for riding with LV Transport.`,
    });
  },
};

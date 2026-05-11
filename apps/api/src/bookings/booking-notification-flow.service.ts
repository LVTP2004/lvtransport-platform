import crypto from 'node:crypto';
import { notificationService } from '../notifications/notification.service.js';
import type { NotificationMessage } from '../notifications/notification.types.js';
import { trackingService } from '../tracking/tracking.service.js';

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

const baseMessage = (context: BookingNotificationContext, title: string, body: string): NotificationMessage => ({
  notificationId: crypto.randomUUID(),
  bookingId: context.bookingId,
  audience: 'customer',
  recipient: { recipientId: context.customerId, email: context.customerEmail, phone: context.customerPhone },
  channels: ['email', 'in_app'],
  title,
  body,
});

export const bookingNotificationFlowService = {
  onBookingConfirmed(context: BookingNotificationContext) {
    const trackingLink = trackingService.createTrackingLink(context.bookingId, context.customerId);
    return notificationService.queue(
      baseMessage(context, 'Booking confirmed', `Your ride is confirmed. Track here: ${trackingLink.publicUrl}`),
    );
  },

  onBookingStatusUpdated(context: BookingNotificationContext) {
    return notificationService.queue(
      baseMessage(context, 'Booking status updated', `Booking ${context.bookingId} is now ${context.status}.`),
    );
  },

  onDriverAssigned(context: BookingNotificationContext) {
    const customerResult = notificationService.queue(
      baseMessage(context, 'Driver assigned', `A driver has been assigned to booking ${context.bookingId}.`),
    );

    const driverResult = context.driverId
      ? notificationService.queue({
          notificationId: crypto.randomUUID(),
          bookingId: context.bookingId,
          audience: 'driver',
          recipient: { recipientId: context.driverId, phone: context.driverPhone },
          channels: ['push', 'in_app'],
          title: 'New trip assignment',
          body: `You have been assigned to booking ${context.bookingId}.`,
        })
      : null;

    return { customerResult, driverResult };
  },

  onAdminNewBookingAlert(context: BookingNotificationContext) {
    return notificationService.queue({
      notificationId: crypto.randomUUID(),
      bookingId: context.bookingId,
      audience: 'admin',
      recipient: { recipientId: context.adminId },
      channels: ['in_app'],
      title: 'New booking created',
      body: `Booking ${context.bookingId} requires dispatch review.`,
    });
  },
};

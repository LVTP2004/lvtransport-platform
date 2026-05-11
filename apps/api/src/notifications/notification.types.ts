import { NOTIFICATION_CHANNELS } from '../constants/index.js';

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];
export type NotificationAudience = 'customer' | 'driver' | 'admin';
export type NotificationProvider = 'mock_dev';
export type NotificationLifecycleStatus = 'queued' | 'delivered' | 'retrying' | 'failed';
export type NotificationTemplateKind = 'booking_confirmation' | 'booking_status_update' | 'driver_assigned' | 'admin_new_booking_alert';

export interface BookingNotificationContext {
  bookingId: string;
  customerId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  pickup: string;
  dropoff: string;
  scheduledAt: string;
  trackingCode: string;
  trackingUrl: string;
  driverId?: string;
  driverName?: string;
}

export interface NotificationMessage {
  id: string;
  recipientId: string;
  audience: NotificationAudience;
  channel: NotificationChannel;
  title: string;
  body: string;
  provider: NotificationProvider;
  template: NotificationTemplateKind;
  templateData: BookingNotificationContext;
  delivery: {
    status: NotificationLifecycleStatus;
    attempts: number;
    maxAttempts: number;
    retryAt?: string;
    failureReason?: string;
  };
  createdAt: string;
}

export interface NotificationDeliveryLog {
  notificationId: string;
  recipientId: string;
  audience: NotificationAudience;
  channel: NotificationChannel;
  provider: NotificationProvider;
  status: NotificationLifecycleStatus;
  attempt: number;
  occurredAt: string;
  failureReason?: string;
}

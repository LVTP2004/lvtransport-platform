import { NOTIFICATION_CHANNELS } from '../constants/index.js';

export type NotificationChannel =
  | (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS]
  | 'sms'
  | 'whatsapp'
  | 'webhook';

export type NotificationAudience = 'customer' | 'driver' | 'admin' | 'support' | 'business';

export type DeliveryStatus = 'queued' | 'sent' | 'failed' | 'retrying';

export type NotificationProvider = 'mock_dev' | 'internal_push_router';

export type NotificationEventType =
  | 'booking.confirmation'
  | 'booking.status.updated'
  | 'booking.driver.assigned'
  | 'admin.booking.created';

export interface NotificationMessage {
  notificationId: string;
  id?: string;
  bookingId?: string;
  recipientId: string;
  audience: NotificationAudience;
  channel: NotificationChannel;
  eventType?: NotificationEventType;
  template: 'booking_confirmation' | 'booking_status_update' | 'driver_assigned' | 'admin_new_booking_alert';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  retryCount: number;
  status: DeliveryStatus;
  occurredAt: string;
}

export interface NotificationDeliveryLogEntry {
  notificationId: string;
  status: DeliveryStatus;
  provider: NotificationProvider;
  attempts: number;
  lastAttemptAt: string;
  error?: string;
}

import { NOTIFICATION_CHANNELS } from '../constants/index.js';

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS] | 'whatsapp';
export type NotificationAudience = 'customer' | 'driver' | 'admin';
export type DeliveryStatus = 'queued' | 'sent' | 'failed' | 'retrying';

export interface NotificationMessage {
  notificationId: string;
  recipientId: string;
  audience: NotificationAudience;
  channel: NotificationChannel;
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
  provider: 'mock_dev';
  attempts: number;
  lastAttemptAt: string;
  error?: string;
}

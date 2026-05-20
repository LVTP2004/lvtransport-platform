import { NOTIFICATION_CHANNELS } from '../constants/index.js';

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS] | 'whatsapp';

export type NotificationAudience = 'customer' | 'driver' | 'admin';
export type NotificationLifecycleStatus = 'queued' | 'sent' | 'failed' | 'retrying';
export type NotificationEventType =
  | 'booking.confirmation'
  | 'booking.status.updated'
  | 'booking.driver.assigned'
  | 'admin.booking.created';

export interface NotificationMessage {
  id?: string;
  bookingId: string;
  recipientId: string;
  audience: NotificationAudience;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface NotificationTemplate {
  subject: string;
  previewText: string;
  bodyLines: string[];
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface DeliveryLogEntry {
  id: string;
  notificationId: string;
  bookingId: string;
  channel: NotificationChannel;
  provider: 'mock-dev';
  status: NotificationLifecycleStatus;
  attempt: number;
  errorMessage?: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

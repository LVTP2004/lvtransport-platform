import { NOTIFICATION_CHANNELS } from '../constants/index.js';

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];
export type NotificationAudience = 'customer' | 'driver' | 'admin';
export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'retrying';

export interface NotificationRecipient {
  recipientId: string;
  email?: string;
  phone?: string;
}

export interface NotificationMessage {
  notificationId: string;
  bookingId: string;
  audience: NotificationAudience;
  recipient: NotificationRecipient;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface NotificationDeliveryLog {
  id: string;
  notificationId: string;
  bookingId: string;
  channel: NotificationChannel;
  provider: 'mock-dev';
  status: NotificationStatus;
  attempts: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplateSet {
  email: { subject: string; preview: string; html: string; text: string };
  whatsapp: { text: string; variables: Record<string, string> };
}

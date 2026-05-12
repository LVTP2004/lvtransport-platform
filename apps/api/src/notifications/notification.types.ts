import { NOTIFICATION_CHANNELS } from '../constants/index.js';

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS] | 'sms' | 'whatsapp' | 'webhook';
export type NotificationAudience = 'customer' | 'driver' | 'admin' | 'support' | 'business';
export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'retrying';
export type NotificationLifecycleState = 'queued' | 'processing' | 'sent' | 'delivered' | 'failed' | 'dead_lettered';
export type NotificationType =
  | 'booking_confirmation'
  | 'driver_assigned'
  | 'booking_status_update'
  | 'driver_assignment'
  | 'admin_new_booking_alert';

export interface NotificationRecipient {
  recipientId: string;
  email?: string;
  phone?: string;
}

export interface BookingNotificationContext {
  bookingId?: string;
  customerId: string;
  status: string;
  pickup: string;
  dropoff: string;
  driverName?: string;
  trackingCode: string;
  trackingUrl: string;
}

export interface NotificationMessage {
  notificationId?: string;
  bookingId?: string;
  audience: NotificationAudience;
  recipient?: NotificationRecipient;
  recipientId?: string;
  channels?: NotificationChannel[];
  channel?: NotificationChannel;
  type?: NotificationType;
  state?: NotificationLifecycleState;
  title: string;
  body: string;
  data?: Record<string, string>;
  template?: NotificationType;
  templateData?: object;
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

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  bodyText: string;
  bodyHtml?: string;
  placeholders: string[];
  enabled: boolean;
  version: number;
}

import { NOTIFICATION_CHANNELS } from '../constants/index.js';

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS] | 'sms' | 'whatsapp' | 'webhook';

export type NotificationAudience = 'customer' | 'driver' | 'admin' | 'support' | 'business';

export type NotificationType =
  | 'booking_confirmation'
  | 'booking_status_update'
  | 'driver_assignment'
  | 'customer_tracking_link'
  | 'admin_alert'
  | 'payment_confirmation'
  | 'invoice_preparation'
  | 'booking_cancellation'
  | 'support_ticket_update'
  | 'vip_business_update';

export type NotificationLifecycleState =
  | 'draft'
  | 'queued'
  | 'scheduled'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'retrying'
  | 'dead_letter'
  | 'suppressed';

export interface NotificationMessage {
  id: string;
  tenantId?: string;
  bookingId?: string;
  paymentId?: string;
  ticketId?: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  audience: NotificationAudience;
  type: NotificationType;
  channel: NotificationChannel;
  locale?: string;
  title: string;
  body: string;
  templateId: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  dedupeKey?: string;
  scheduledAt?: string;
  createdAt: string;
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

export interface NotificationPreference {
  userId: string;
  channel: NotificationChannel;
  type: NotificationType;
  enabled: boolean;
  quietHours?: { start: string; end: string; timezone: string };
}

export interface DeliveryAttempt {
  attempt: number;
  state: NotificationLifecycleState;
  provider: 'smtp_placeholder' | 'push_placeholder' | 'sms_placeholder' | 'whatsapp_placeholder' | 'webhook_placeholder';
  attemptedAt: string;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface NotificationDeliveryLog {
  notificationId: string;
  finalState: NotificationLifecycleState;
  attempts: DeliveryAttempt[];
  lastUpdatedAt: string;
}

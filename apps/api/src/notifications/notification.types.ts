export type NotificationChannel = 'email' | 'push' | 'sms' | 'whatsapp' | 'webhook';
export type NotificationAudience = 'customer' | 'driver' | 'admin' | 'support' | 'business';
export type DeliveryStatus = 'queued' | 'sent' | 'failed' | 'retrying';
export type NotificationProvider = 'mock_dev' | 'internal_push_router';
export type NotificationType =
  | 'booking_confirmation'
  | 'booking_status_update'
  | 'driver_assigned'
  | 'admin_new_booking_alert'
  | 'driver_assignment';

export interface NotificationMessage {
  notificationId?: string;
  bookingId?: string;
  recipientId: string;
  audience: NotificationAudience;
  channel: NotificationChannel;
  template: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  retryCount?: number;
  status?: DeliveryStatus;
  occurredAt?: string;
}

export interface NotificationDeliveryLogEntry {
  notificationId: string;
  status: DeliveryStatus;
  provider: NotificationProvider;
  attempts: number;
  lastAttemptAt: string;
  error?: string;
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

export interface NotificationEventEnvelope {
  notificationId: string;
  type: NotificationType;
  status: DeliveryStatus;
  occurredAt: string;
  payload?: Record<string, unknown>;
}

import { NOTIFICATION_CHANNELS } from '../constants/index.js';

export type NotificationChannel =
  | (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS]
  | 'sms'
  | 'whatsapp'
  | 'webhook'
  | 'push';

export type NotificationAudience = 'customer' | 'driver' | 'admin' | 'support' | 'business';

export type NotificationProvider = 'mock_dev' | 'mock-dev' | 'internal_push_router';

export type NotificationType =
  | 'booking_confirmation'
  | 'booking_status_update'
  | 'driver_assignment'
  | 'dispatch_event'
  | 'admin_alert'
  | 'operational_warning'
  | 'customer_tracking_link'
  | 'booking_cancellation';

export type NotificationEventType =
  | 'booking.confirmation'
  | 'booking.status.updated'
  | 'booking.driver.assigned'
  | 'admin.booking.created';

export type NotificationLifecycleStatus =
  | 'queued'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'retrying'
  | 'failed'
  | 'archived';

export type DeliveryStatus = NotificationLifecycleStatus;

export interface NotificationMessage {
  id?: string;
  notificationId?: string;
  bookingId: string;
  recipientId: string;
  audience: NotificationAudience;
  channel: NotificationChannel;
  channels?: NotificationChannel[];
  eventType?: NotificationEventType;
  type?: NotificationType;
  template?:
    | 'booking_confirmation'
    | 'booking_status_update'
    | 'driver_assigned'
    | 'admin_new_booking_alert';
  title: string;
  body: string;
  header?: string;
  footer?: string;
  ctaUrl?: string;
  data?: Record<string, unknown>;
  retryCount?: number;
  status?: DeliveryStatus;
  occurredAt?: string;
  createdAt?: string;
  provider?: NotificationProvider;
  lifecycle?: {
    status: NotificationLifecycleStatus;
    attempts: number;
    maxAttempts: number;
    updatedAt: string;
    retryAt?: string;
    failureReason?: string;
    archivedAt?: string;
  };
}

export interface NotificationDeliveryLogEntry {
  notificationId: string;
  status: DeliveryStatus;
  provider: NotificationProvider;
  attempts: number;
  lastAttemptAt: string;
  error?: string;
}

export interface NotificationDeliveryLog {
  id: string;
  notificationId: string;
  bookingId?: string;
  recipientId: string;
  audience: NotificationAudience;
  channel: NotificationChannel;
  provider: NotificationProvider;
  status: NotificationLifecycleStatus;
  attempt: number;
  occurredAt: string;
  failureReason?: string;
}

export interface DeliveryLogEntry {
  id: string;
  notificationId: string;
  bookingId: string;
  channel: NotificationChannel;
  provider: NotificationProvider;
  status: NotificationLifecycleStatus;
  attempt: number;
  errorMessage?: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueueEntry {
  queueId: string;
  notificationId: string;
  state: NotificationLifecycleStatus;
  enqueuedAt: string;
  audience: NotificationAudience;
}

export interface NotificationDiagnostics {
  totalNotifications: number;
  activeNotifications: number;
  failedNotifications: number;
  retryingNotifications: number;
  queuedEvents: number;
  lastUpdatedAt: string;
}

export interface NotificationEventEnvelope {
  notificationId: string;
  bookingId?: string;
  audience: NotificationAudience;
  type: NotificationType;
  channels: NotificationChannel[];
  state: NotificationLifecycleStatus;
  message: string;
  occurredAt: string;
  reconnectSafe: boolean;
}

export interface NotificationTemplate {
  id?: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  subject: string;
  previewText?: string;
  bodyText?: string;
  bodyHtml?: string;
  bodyLines?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  placeholders?: string[];
  enabled?: boolean;
  version?: number;
}

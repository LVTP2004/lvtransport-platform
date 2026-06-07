export type NotificationChannel = 'email' | 'in_app' | 'push' | 'sms' | 'whatsapp';
export type NotificationLifecycleStatus = 'queued' | 'retrying' | 'delivered' | 'failed' | 'archived';
export type NotificationProvider = 'internal_push_router' | 'mock_dev' | string;

export interface NotificationMessage {
  notificationId: string;
  bookingId?: string;
  recipientId: string;
  audience: 'customer' | 'driver' | 'admin';
  type: string;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
  provider: NotificationProvider;
  lifecycle: {
    status: NotificationLifecycleStatus;
    attempts: number;
    maxAttempts: number;
    updatedAt: string;
    failureReason?: string;
    retryAt?: string;
    archivedAt?: string;
  };
}

export interface NotificationDeliveryLog {
  id: string;
  notificationId: string;
  bookingId?: string;
  channel: NotificationChannel;
  provider: NotificationProvider;
  status: NotificationLifecycleStatus;
  attempt: number;
  createdAt: string;
}

export interface NotificationQueueEntry {
  queueId: string;
  notificationId: string;
  state: NotificationLifecycleStatus;
  enqueuedAt: string;
  audience: string;
}

export type NotificationType = string;

export interface NotificationEventEnvelope {
  eventId: string;
  notificationId: string;
  status: NotificationLifecycleStatus;
  emittedAt: string;
  payload?: Record<string, unknown>;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  channel: NotificationChannel;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  placeholders: string[];
  enabled: boolean;
  version: number;
}

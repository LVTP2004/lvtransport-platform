import { randomUUID } from 'node:crypto';
import type {
  DeliveryLogEntry,
  NotificationDeliveryLogEntry,
  NotificationDiagnostics,
  NotificationEventEnvelope,
  NotificationLifecycleStatus,
  NotificationMessage,
  NotificationProvider,
  NotificationQueueEntry,
  NotificationType
} from './notification.types.js';

type Provider = {
  name: NotificationProvider;
};

const DEFAULT_PROVIDER: Provider = {
  name: 'mock_dev'
};

const toNotificationType = (message: NotificationMessage): NotificationType => {
  if (message.type) return message.type;

  switch (message.eventType) {
    case 'booking.confirmation':
      return 'booking_confirmation';
    case 'booking.status.updated':
      return 'booking_status_update';
    case 'booking.driver.assigned':
      return 'driver_assignment';
    case 'admin.booking.created':
      return 'admin_alert';
    default:
      return 'dispatch_event';
  }
};

export class NotificationService {
  private readonly provider = DEFAULT_PROVIDER;
  private readonly messages: NotificationMessage[] = [];
  private readonly deliveryLog: DeliveryLogEntry[] = [];
  private readonly legacyDeliveryLog: NotificationDeliveryLogEntry[] = [];
  private readonly operationalQueue: NotificationQueueEntry[] = [];

  queueNotification(message: NotificationMessage): NotificationMessage {
    const notificationId = message.notificationId ?? message.id ?? randomUUID();
    const now = new Date().toISOString();

    const normalized: NotificationMessage = {
      ...message,
      notificationId,
      id: message.id ?? notificationId,
      channels: message.channels ?? [message.channel],
      retryCount: message.retryCount ?? 0,
      status: message.status ?? 'queued',
      occurredAt: message.occurredAt ?? now,
      createdAt: message.createdAt ?? now,
      provider: message.provider ?? this.provider.name,
      lifecycle: message.lifecycle ?? {
        status: 'queued',
        attempts: 0,
        maxAttempts: 4,
        updatedAt: now
      }
    };

    this.messages.unshift(normalized);
    this.operationalQueue.unshift({
      queueId: randomUUID(),
      notificationId,
      state: 'queued',
      enqueuedAt: now,
      audience: normalized.audience
    });

    this.pushLog(notificationId, normalized, 'queued', 0);
    return normalized;
  }

  queue(message: NotificationMessage): NotificationMessage {
    return this.queueNotification(message);
  }

  markSent(notificationId: string): NotificationMessage | null {
    return this.transition(notificationId, 'sent');
  }

  markDelivered(notificationId: string): NotificationMessage | null {
    return this.transition(notificationId, 'delivered');
  }

  markFailed(notificationId: string, failureReason = 'Notification delivery failed'): NotificationMessage | null {
    return this.transition(notificationId, 'failed', failureReason);
  }

  retry(notificationId: string): NotificationMessage | null {
    return this.transition(notificationId, 'retrying');
  }

  listNotifications(): NotificationMessage[] {
    return [...this.messages];
  }

  getDeliveryLog(): DeliveryLogEntry[] {
    return [...this.deliveryLog];
  }

  getLegacyDeliveryLog(): NotificationDeliveryLogEntry[] {
    return [...this.legacyDeliveryLog];
  }

  getQueue(): NotificationQueueEntry[] {
    return [...this.operationalQueue];
  }

  getDiagnostics(): NotificationDiagnostics {
    return {
      totalNotifications: this.messages.length,
      activeNotifications: this.messages.filter((message) => {
        const status = message.lifecycle?.status ?? message.status;
        return status !== 'delivered' && status !== 'sent' && status !== 'failed' && status !== 'archived';
      }).length,
      failedNotifications: this.messages.filter((message) => (message.lifecycle?.status ?? message.status) === 'failed').length,
      retryingNotifications: this.messages.filter((message) => (message.lifecycle?.status ?? message.status) === 'retrying').length,
      queuedEvents: this.operationalQueue.length,
      lastUpdatedAt: new Date().toISOString()
    };
  }

  toEventEnvelope(message: NotificationMessage): NotificationEventEnvelope {
    const notificationId = message.notificationId ?? message.id ?? randomUUID();
    const state = message.lifecycle?.status ?? message.status ?? 'queued';

    return {
      notificationId,
      bookingId: message.bookingId,
      audience: message.audience,
      type: toNotificationType(message),
      channels: message.channels ?? [message.channel],
      state,
      message: message.body,
      occurredAt: message.occurredAt ?? message.createdAt ?? new Date().toISOString(),
      reconnectSafe: true
    };
  }

  private transition(
    notificationId: string,
    status: NotificationLifecycleStatus,
    failureReason?: string
  ): NotificationMessage | null {
    const message = this.messages.find((item) => item.notificationId === notificationId || item.id === notificationId);

    if (!message) {
      return null;
    }

    const now = new Date().toISOString();
    const attempts = (message.lifecycle?.attempts ?? message.retryCount ?? 0) + 1;

    message.status = status;
    message.retryCount = attempts;
    message.lifecycle = {
      ...(message.lifecycle ?? {
        status,
        attempts,
        maxAttempts: 4,
        updatedAt: now
      }),
      status,
      attempts,
      updatedAt: now,
      failureReason
    };

    this.pushLog(notificationId, message, status, attempts, failureReason);
    return message;
  }

  private pushLog(
    notificationId: string,
    message: NotificationMessage,
    status: NotificationLifecycleStatus,
    attempt: number,
    errorMessage?: string
  ): DeliveryLogEntry {
    const now = new Date().toISOString();

    const entry: DeliveryLogEntry = {
      id: randomUUID(),
      notificationId,
      bookingId: message.bookingId,
      channel: message.channel,
      provider: this.provider.name,
      status,
      attempt,
      errorMessage,
      payload: {
        title: message.title,
        body: message.body,
        recipientId: message.recipientId,
        audience: message.audience,
        eventType: message.eventType,
        type: message.type,
        ...message.data
      },
      createdAt: now,
      updatedAt: now
    };

    this.deliveryLog.unshift(entry);
    this.legacyDeliveryLog.unshift({
      notificationId,
      status,
      provider: this.provider.name,
      attempts: attempt + 1,
      lastAttemptAt: now,
      error: errorMessage
    });

    return entry;
  }
}

export const notificationService = new NotificationService();

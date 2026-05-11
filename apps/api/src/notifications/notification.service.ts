import { emitNotificationEvent } from './notification.events.js';
import type {
  NotificationChannel,
  NotificationDeliveryLog,
  NotificationMessage,
  NotificationStatus,
  NotificationTemplateSet,
} from './notification.types.js';

const deliveryLogs: NotificationDeliveryLog[] = [];

const buildTemplateSet = (message: NotificationMessage): NotificationTemplateSet => ({
  email: {
    subject: message.title,
    preview: message.body,
    text: `${message.title}\n\n${message.body}`,
    html: `<h2>${message.title}</h2><p>${message.body}</p><p>Booking: ${message.bookingId}</p>`,
  },
  whatsapp: {
    text: `${message.title} - ${message.body}`,
    variables: {
      bookingId: message.bookingId,
      audience: message.audience,
    },
  },
});

export class NotificationService {
  queue(message: NotificationMessage) {
    const templates = buildTemplateSet(message);
    const logs = message.channels.map((channel) => this.deliverWithMockProvider(message, channel));

    emitNotificationEvent({
      notificationId: message.notificationId,
      audience: message.audience,
      channels: message.channels,
      message: message.body,
      occurredAt: new Date().toISOString(),
    });

    return { queued: true, message, templates, logs };
  }

  private deliverWithMockProvider(message: NotificationMessage, channel: NotificationChannel): NotificationDeliveryLog {
    const now = new Date().toISOString();
    const failureRequested = Boolean(message.data?.['forceFailure']);
    const status: NotificationStatus = failureRequested ? 'failed' : 'sent';
    const log: NotificationDeliveryLog = {
      id: `${message.notificationId}:${channel}`,
      notificationId: message.notificationId,
      bookingId: message.bookingId,
      channel,
      provider: 'mock-dev',
      status,
      attempts: 1,
      error: failureRequested ? 'Mock provider failure for retry flow testing.' : undefined,
      createdAt: now,
      updatedAt: now,
    };
    deliveryLogs.push(log);
    return log;
  }

  markRetry(notificationId: string, channel: NotificationChannel) {
    const entry = deliveryLogs.find((log) => log.notificationId === notificationId && log.channel === channel);
    if (!entry) return null;
    entry.status = 'retrying';
    entry.attempts += 1;
    entry.updatedAt = new Date().toISOString();
    return entry;
  }

  getLogs() {
    return deliveryLogs;
import { randomUUID } from 'node:crypto';
import type { NotificationDeliveryLog, NotificationMessage, BookingNotificationContext, NotificationTemplateKind } from './notification.types.js';

const DEFAULT_MAX_ATTEMPTS = 3;

export const buildTrackingCode = (bookingId: string): string => `trk_${bookingId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toLowerCase()}`;
export const buildTrackingUrl = (trackingCode: string): string => `/tracking/${trackingCode}`;

export const buildEmailTemplate = (template: NotificationTemplateKind, context: BookingNotificationContext) => ({
  subject: `[LV Transport] ${template.replace(/_/g, ' ')}`,
  preheader: `${context.pickup} → ${context.dropoff}`,
  html: `<h1>${template}</h1><p>Booking ${context.bookingId}</p><p>Tracking: ${context.trackingUrl}</p>`,
  text: `${template} | Booking ${context.bookingId} | Tracking: ${context.trackingUrl}`,
});

export const buildWhatsAppTemplate = (template: NotificationTemplateKind, context: BookingNotificationContext) => ({
  templateName: `lv_${template}`,
  locale: 'en_US',
  placeholders: {
    bookingId: context.bookingId,
    pickup: context.pickup,
    dropoff: context.dropoff,
    trackingUrl: context.trackingUrl,
    driverName: context.driverName ?? 'TBD',
  },
});

export class NotificationService {
  private queueStore: NotificationMessage[] = [];
  private deliveryLogs: NotificationDeliveryLog[] = [];

  queue(message: Omit<NotificationMessage, 'id' | 'createdAt' | 'provider' | 'delivery'>) {
    const queued: NotificationMessage = {
      ...message,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      provider: 'mock_dev',
      delivery: {
        status: 'queued',
        attempts: 0,
        maxAttempts: DEFAULT_MAX_ATTEMPTS,
      },
    };

    this.queueStore.push(queued);
    this.logDelivery(queued, 'queued');

    return { queued: true, message: queued };
  }

  deliver(notificationId: string, shouldFail = false) {
    const notification = this.queueStore.find((item) => item.id === notificationId);
    if (!notification) return { delivered: false, reason: 'not_found' };

    notification.delivery.attempts += 1;

    if (shouldFail) {
      notification.delivery.status = notification.delivery.attempts >= notification.delivery.maxAttempts ? 'failed' : 'retrying';
      notification.delivery.failureReason = 'mock_provider_error';
      notification.delivery.retryAt = new Date(Date.now() + 30_000).toISOString();
      this.logDelivery(notification, notification.delivery.status, notification.delivery.failureReason);
      return { delivered: false, message: notification };
    }

    notification.delivery.status = 'delivered';
    notification.delivery.failureReason = undefined;
    notification.delivery.retryAt = undefined;
    this.logDelivery(notification, 'delivered');
    return { delivered: true, message: notification };
  }

  getDeliveryLogs() {
    return [...this.deliveryLogs];
  }

  private logDelivery(message: NotificationMessage, status: NotificationDeliveryLog['status'], failureReason?: string) {
    this.deliveryLogs.push({
      notificationId: message.id,
      recipientId: message.recipientId,
      audience: message.audience,
      channel: message.channel,
      provider: message.provider,
      status,
      attempt: message.delivery.attempts,
      occurredAt: new Date().toISOString(),
      failureReason,
    });
import type {
  NotificationDeliveryLog,
  NotificationLifecycleState,
  NotificationMessage
} from './notification.types.js';

export class NotificationService {
  queue(message: NotificationMessage) {
    return {
      queued: true,
      queueName: 'notification.queue.main',
      state: 'queued' as NotificationLifecycleState,
      message
    };
  }

  scheduleRetry(notificationId: string, attempt: number, nextAttemptAt: string) {
    return {
      notificationId,
      attempt,
      nextAttemptAt,
      queueName: 'notification.queue.retry',
      state: 'retrying' as NotificationLifecycleState
    };
  }

  recordDeliveryLog(log: NotificationDeliveryLog) {
    return {
      persisted: true,
      collection: 'notification_delivery_logs',
      log
    };
  }
}

export const notificationService = new NotificationService();

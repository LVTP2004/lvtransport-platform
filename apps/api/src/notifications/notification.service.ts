import crypto from 'node:crypto';
import { emitNotificationEvent } from './notification.events.js';
import type {
  NotificationChannel,
  NotificationDeliveryLog,
  NotificationLifecycleStatus,
  NotificationMessage,
  NotificationTemplateSet,
  NotificationType,
} from './notification.types.js';

const DEFAULT_MAX_ATTEMPTS = 3;
const STALE_AFTER_MS = 10 * 60 * 1000;

const buildTemplateSet = (message: NotificationMessage): NotificationTemplateSet => ({
  email: {
    subject: message.title,
    preview: message.body,
    text: `${message.title}\n\n${message.body}`,
    html: `<h2>${message.title}</h2><p>${message.body}</p><p>Booking: ${message.bookingId ?? 'n/a'}</p>`,
  },
  whatsapp: {
    text: `${message.title} - ${message.body}`,
    variables: {
      bookingId: message.bookingId ?? 'n/a',
      audience: message.audience,
    },
  },
});

export class NotificationService {
  private notificationStore: NotificationMessage[] = [];
  private deliveryLogs: NotificationDeliveryLog[] = [];

  queue(input: Omit<NotificationMessage, 'notificationId' | 'createdAt' | 'provider' | 'lifecycle'>) {
    const now = new Date().toISOString();
    const message: NotificationMessage = {
      ...input,
      notificationId: crypto.randomUUID(),
      createdAt: now,
      provider: 'mock_dev',
      lifecycle: {
        status: 'queued',
        attempts: 0,
        maxAttempts: DEFAULT_MAX_ATTEMPTS,
        updatedAt: now,
      },
    };

    this.notificationStore.push(message);
    this.emitLifecycle(message, 'queued');

    return { queued: true, message, templates: buildTemplateSet(message) };
  }

  deliver(notificationId: string, opts: { forceFailure?: boolean } = {}) {
    const message = this.notificationStore.find((item) => item.notificationId === notificationId);
    if (!message) return { delivered: false, reason: 'not_found' as const };

    message.lifecycle.attempts += 1;
    message.lifecycle.updatedAt = new Date().toISOString();
    const status: NotificationLifecycleStatus = opts.forceFailure
      ? message.lifecycle.attempts >= message.lifecycle.maxAttempts
        ? 'failed'
        : 'retrying'
      : 'delivered';

    message.lifecycle.status = status;
    message.lifecycle.failureReason = status === 'failed' || status === 'retrying' ? 'mock_provider_error' : undefined;
    message.lifecycle.retryAt = status === 'retrying' ? new Date(Date.now() + 30_000).toISOString() : undefined;

    message.channels.forEach((channel) => this.logDelivery(message, channel, status));
    this.emitLifecycle(message, status);
    return { delivered: status === 'delivered', message };
  }

  archiveOperationalAlertsForBooking(bookingId: string) {
    const now = new Date().toISOString();
    this.notificationStore
      .filter((item) => item.bookingId === bookingId && item.lifecycle.status !== 'archived')
      .forEach((item) => {
        item.lifecycle.status = 'archived';
        item.lifecycle.archivedAt = now;
        item.lifecycle.updatedAt = now;
        this.emitLifecycle(item, 'archived');
      });
  }

  listActiveOperationalAlerts(audience?: NotificationMessage['audience']) {
    return this.notificationStore.filter(
      (item) =>
        item.lifecycle.status !== 'archived' &&
        item.lifecycle.status !== 'delivered' &&
        (!audience || item.audience === audience),
    );
  }

  detectStaleOperations() {
    const staleBefore = Date.now() - STALE_AFTER_MS;
    return this.notificationStore.filter(
      (item) =>
        item.lifecycle.status !== 'archived' &&
        item.lifecycle.status !== 'delivered' &&
        new Date(item.lifecycle.updatedAt).getTime() < staleBefore,
    );
  }

  restoreActiveNotifications(recipientId: string) {
    return this.notificationStore.filter(
      (item) =>
        item.recipientId === recipientId && item.lifecycle.status !== 'archived' && item.lifecycle.status !== 'delivered',
    );
  }

  createOperationalWarning(recipientId: string, bookingId: string, body: string, type: NotificationType = 'operational_warning') {
    return this.queue({
      bookingId,
      recipientId,
      audience: 'admin',
      type,
      channels: ['in_app'],
      title: 'Operational warning',
      body,
      data: { severity: 'high' },
    });
  }

  getDeliveryLogs() {
    return [...this.deliveryLogs];
  }

  getLogs() {
    return this.getDeliveryLogs();
  }

  private emitLifecycle(message: NotificationMessage, state: NotificationLifecycleStatus) {
    emitNotificationEvent({
      notificationId: message.notificationId,
      bookingId: message.bookingId,
      audience: message.audience,
      type: message.type,
      channels: message.channels,
      state,
      message: message.body,
      occurredAt: new Date().toISOString(),
    });
  }

  private logDelivery(message: NotificationMessage, channel: NotificationChannel, status: NotificationLifecycleStatus) {
    this.deliveryLogs.push({
      id: `${message.notificationId}:${channel}:${message.lifecycle.attempts}`,
      notificationId: message.notificationId,
      bookingId: message.bookingId,
      recipientId: message.recipientId,
      audience: message.audience,
      channel,
      provider: message.provider,
      status,
      attempt: message.lifecycle.attempts,
      occurredAt: new Date().toISOString(),
      failureReason: message.lifecycle.failureReason,
    });
  }
}

export const notificationService = new NotificationService();

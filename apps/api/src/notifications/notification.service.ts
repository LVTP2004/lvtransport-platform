import { randomUUID } from 'node:crypto';
import type { DeliveryLogEntry, NotificationMessage, NotificationTemplate } from './notification.types.js';

const MAX_RETRIES = 3;

class MockNotificationProvider {
  readonly name = 'mock-dev' as const;

  send(message: NotificationMessage) {
    const forcedFailure = typeof message.data?.['forceFail'] === 'boolean' && message.data['forceFail'] === true;

    return {
      ok: !forcedFailure,
      providerMessageId: `mock_${randomUUID().slice(0, 8)}`,
      errorMessage: forcedFailure ? 'Forced failure for dev retry flow.' : undefined
    };
  }
}

export class NotificationService {
  private readonly provider = new MockNotificationProvider();
  private readonly deliveryLog: DeliveryLogEntry[] = [];

  queue(message: NotificationMessage) {
    const notificationId = message.id ?? randomUUID();
    let attempt = 1;
    let result = this.provider.send({ ...message, id: notificationId });

    while (!result.ok && attempt < MAX_RETRIES) {
      attempt += 1;
      this.pushLog(notificationId, message, 'retrying', attempt - 1, result.errorMessage);
      result = this.provider.send({ ...message, id: notificationId });
    }

    const finalStatus = result.ok ? 'sent' : 'failed';
    const entry = this.pushLog(notificationId, message, finalStatus, attempt, result.errorMessage);

    return {
      queued: true,
      notificationId,
      status: finalStatus,
      provider: this.provider.name,
      delivery: entry
    };
import type { NotificationDeliveryLogEntry, NotificationMessage } from './notification.types.js';

const MAX_RETRIES = 3;

export class NotificationService {
  private readonly deliveryLog: NotificationDeliveryLogEntry[] = [];

  queue(message: Omit<NotificationMessage, 'status' | 'retryCount'>) {
    const prepared: NotificationMessage = { ...message, status: 'queued', retryCount: 0 };
    return this.deliver(prepared);
  }

  private deliver(message: NotificationMessage) {
    const shouldFail = typeof message.data?.['forceFailure'] === 'boolean' && message.data.forceFailure;

    if (shouldFail && message.retryCount < MAX_RETRIES) {
      const retryingMessage: NotificationMessage = {
        ...message,
        status: 'retrying',
        retryCount: message.retryCount + 1
      };
      this.log(retryingMessage, 'Forced mock provider failure.');
      return this.deliver(retryingMessage);
    }

    if (shouldFail && message.retryCount >= MAX_RETRIES) {
      const failedMessage: NotificationMessage = { ...message, status: 'failed' };
      this.log(failedMessage, 'Max retries reached in mock provider.');
      return { queued: false, delivered: false, message: failedMessage };
    }

    const sentMessage: NotificationMessage = { ...message, status: 'sent' };
    this.log(sentMessage);
    return { queued: true, delivered: true, message: sentMessage };
  }

  getDeliveryLog() {
    return this.deliveryLog;
  }

  buildEmailTemplate(template: NotificationTemplate) {
    return {
      ...template,
      html: `<h1>${template.subject}</h1><p>${template.previewText}</p>${template.bodyLines
        .map((line) => `<p>${line}</p>`)
        .join('')}${template.ctaUrl ? `<a href="${template.ctaUrl}">${template.ctaLabel ?? 'Open'}</a>` : ''}`,
      text: `${template.subject}\n${template.previewText}\n${template.bodyLines.join('\n')}\n${template.ctaUrl ?? ''}`.trim()
    };
  }

  buildWhatsAppTemplate(message: { header: string; body: string; footer?: string; ctaUrl?: string }) {
    return {
      channel: 'whatsapp',
      provider: this.provider.name,
      template: {
        header: message.header,
        body: message.body,
        footer: message.footer ?? 'Reply STOP to opt out in production.',
        ctaUrl: message.ctaUrl
      }
    };
  }

  private pushLog(
    notificationId: string,
    message: NotificationMessage,
    status: DeliveryLogEntry['status'],
    attempt: number,
    errorMessage?: string
  ) {
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
        ...message.data
      },
      createdAt: now,
      updatedAt: now
    };
    this.deliveryLog.unshift(entry);
    return entry;
  private log(message: NotificationMessage, error?: string) {
    this.deliveryLog.push({
      notificationId: message.notificationId,
      status: message.status,
      provider: 'mock_dev',
      attempts: message.retryCount + 1,
      lastAttemptAt: new Date().toISOString(),
      error
    });
import crypto from 'node:crypto';
import { emitNotificationEvent } from './notification.events.js';
import type {
  NotificationChannel,
  NotificationDeliveryLog,
  NotificationDiagnostics,
  NotificationEventEnvelope,
  NotificationLifecycleStatus,
  NotificationMessage,
  NotificationProvider,
  NotificationQueueEntry,
  NotificationType,
} from './notification.types.js';

const DEFAULT_MAX_ATTEMPTS = 4;
const STALE_AFTER_MS = 10 * 60 * 1000;

const shouldArchiveOnDelivery = (message: NotificationMessage) =>
  message.type === 'booking_status_update' && message.data?.bookingStatus === 'completed';

export class NotificationService {
  private notificationStore: NotificationMessage[] = [];
  private deliveryLogs: NotificationDeliveryLog[] = [];
  private operationalQueue: NotificationQueueEntry[] = [];
  private reconnectCheckpoints = new Map<string, string>();

  queue(input: Omit<NotificationMessage, 'notificationId' | 'createdAt' | 'provider' | 'lifecycle'>) {
    const now = new Date().toISOString();
    const message: NotificationMessage = {
      ...input,
      notificationId: crypto.randomUUID(),
      createdAt: now,
      provider: 'internal_push_router',
      lifecycle: {
        status: 'queued',
        attempts: 0,
        maxAttempts: DEFAULT_MAX_ATTEMPTS,
        updatedAt: now,
      },
    };

    this.notificationStore.push(message);
    this.operationalQueue.push({
      queueId: `${message.notificationId}:queued`,
      notificationId: message.notificationId,
      state: 'queued',
      enqueuedAt: now,
      audience: message.audience,
    });
    this.emitLifecycle(message, 'queued');

    return { queued: true, message };
  }

  deliver(notificationId: string, opts: { forceFailure?: boolean; provider?: NotificationProvider } = {}) {
    const message = this.notificationStore.find((item) => item.notificationId === notificationId);
    if (!message) return { delivered: false, reason: 'not_found' as const };

    message.lifecycle.attempts += 1;
    message.lifecycle.updatedAt = new Date().toISOString();
    if (opts.provider) message.provider = opts.provider;

    const status: NotificationLifecycleStatus = opts.forceFailure
      ? message.lifecycle.attempts >= message.lifecycle.maxAttempts
        ? 'failed'
        : 'retrying'
      : 'delivered';

    message.lifecycle.status = status;
    message.lifecycle.failureReason = status === 'failed' || status === 'retrying' ? 'provider_delivery_error' : undefined;
    message.lifecycle.retryAt = status === 'retrying' ? new Date(Date.now() + 30_000).toISOString() : undefined;

    message.channels.forEach((channel) => this.logDelivery(message, channel, status));
    this.operationalQueue.push({
      queueId: `${message.notificationId}:${status}:${message.lifecycle.attempts}`,
      notificationId: message.notificationId,
      state: status,
      enqueuedAt: new Date().toISOString(),
      audience: message.audience,
    });
    this.emitLifecycle(message, status);

    if (status === 'delivered' && shouldArchiveOnDelivery(message) && message.bookingId) {
      this.archiveOperationalAlertsForBooking(message.bookingId);
    }

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

  restoreActiveNotifications(recipientId: string, checkpoint?: string) {
    const baseline = checkpoint ?? this.reconnectCheckpoints.get(recipientId);
    const pending = this.notificationStore.filter((item) => {
      if (item.recipientId !== recipientId) return false;
      if (item.lifecycle.status === 'archived' || item.lifecycle.status === 'delivered') return false;
      if (!baseline) return true;
      return item.createdAt > baseline;
    });

    this.reconnectCheckpoints.set(recipientId, new Date().toISOString());
    return pending;
  }

  createDriverAssignmentDispatchNotification(input: { bookingId: string; customerId: string; driverId: string; adminId: string }) {
    return {
      customer: this.queue({
        bookingId: input.bookingId,
        recipientId: input.customerId,
        audience: 'customer',
        type: 'driver_assignment',
        channels: ['in_app', 'push'],
        title: 'Driver assigned',
        body: `Driver assignment confirmed for booking ${input.bookingId}.`,
        data: { bookingStatus: 'assigned' },
      }),
      driver: this.queue({
        bookingId: input.bookingId,
        recipientId: input.driverId,
        audience: 'driver',
        type: 'driver_assignment',
        channels: ['push', 'in_app'],
        title: 'New dispatch assignment',
        body: `Dispatch assigned booking ${input.bookingId}.`,
        data: { bookingStatus: 'assigned' },
      }),
      admin: this.queue({
        bookingId: input.bookingId,
        recipientId: input.adminId,
        audience: 'admin',
        type: 'admin_alert',
        channels: ['in_app', 'push'],
        title: 'Dispatch assignment sent',
        body: `Driver assignment push has been issued for booking ${input.bookingId}.`,
        data: { bookingStatus: 'assigned' },
      }),
    };
  }

  getDiagnostics(): NotificationDiagnostics {
    const active = this.notificationStore.filter((n) => !['archived', 'delivered'].includes(n.lifecycle.status)).length;
    const failed = this.notificationStore.filter((n) => n.lifecycle.status === 'failed').length;
    const retrying = this.notificationStore.filter((n) => n.lifecycle.status === 'retrying').length;

    return {
      totalNotifications: this.notificationStore.length,
      activeNotifications: active,
      failedNotifications: failed,
      retryingNotifications: retrying,
      queuedEvents: this.operationalQueue.length,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  getDeliveryLogs() {
    return [...this.deliveryLogs];
  }

  getOperationalQueue() {
    return [...this.operationalQueue];
  }

  private emitLifecycle(message: NotificationMessage, state: NotificationLifecycleStatus) {
    const payload: NotificationEventEnvelope = {
      notificationId: message.notificationId,
      bookingId: message.bookingId,
      audience: message.audience,
      type: message.type,
      channels: message.channels,
      state,
      message: message.body,
      occurredAt: new Date().toISOString(),
      reconnectSafe: true,
    };

    emitNotificationEvent(payload);
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

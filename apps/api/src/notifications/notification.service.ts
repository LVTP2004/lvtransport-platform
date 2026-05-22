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

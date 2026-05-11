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
  }
}

export const notificationService = new NotificationService();

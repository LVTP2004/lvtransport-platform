import { emitNotificationEvent } from './notification.events.js';
import type {
  NotificationChannel,
  NotificationDeliveryLog,
  NotificationMessage,
  NotificationStatus,
  NotificationTemplateSet,
  NotificationType,
} from './notification.types.js';

const deliveryLogs: NotificationDeliveryLog[] = [];

type NormalizedNotificationMessage = NotificationMessage & {
  notificationId: string;
  bookingId: string;
  channels: NotificationChannel[];
};

export const buildTrackingCode = (bookingId: string): string => bookingId.slice(0, 8).toUpperCase();
export const buildTrackingUrl = (trackingCode: string): string => `https://track.lvtransport.example/${trackingCode}`;

const buildTemplateSet = (message: NormalizedNotificationMessage): NotificationTemplateSet => ({
  email: {
    subject: message.title,
    preview: message.body,
    text: `${message.title}\n\n${message.body}`,
    html: `<h2>${message.title}</h2><p>${message.body}</p><p>Booking: ${message.bookingId}</p>`,
  },
  whatsapp: {
    text: `${message.title} - ${message.body}`,
    variables: { bookingId: message.bookingId, audience: message.audience },
  },
});

export const buildEmailTemplate = (type: NotificationType, context: object) => ({ type, context });
export const buildWhatsAppTemplate = (type: NotificationType, context: object) => ({ type, context });

export class NotificationService {
  queue(message: NotificationMessage) {
    const channels = message.channels ?? (message.channel ? [message.channel] : []);
    const normalized: NormalizedNotificationMessage = {
      ...message,
      notificationId: message.notificationId ?? `notif_${Date.now()}`,
      bookingId: message.bookingId ?? 'unknown_booking',
      channels,
    };

    const templates = buildTemplateSet(normalized);
    const logs = normalized.channels.map((channel) => this.deliverWithMockProvider(normalized, channel));

    emitNotificationEvent({
      notificationId: normalized.notificationId,
      bookingId: normalized.bookingId,
      audience: normalized.audience,
      type: normalized.type ?? normalized.template ?? 'booking_status_update',
      channels: normalized.channels,
      state: normalized.state ?? 'queued',
      message: normalized.body,
      occurredAt: new Date().toISOString(),
    });

    return { queued: true, message: normalized, templates, logs };
  }

  private deliverWithMockProvider(message: NormalizedNotificationMessage, channel: NotificationChannel): NotificationDeliveryLog {
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

  getDeliveryLogs() { return deliveryLogs; }
  getLogs() { return deliveryLogs; }
}

export const notificationService = new NotificationService();

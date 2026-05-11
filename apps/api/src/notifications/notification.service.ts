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
  }
}

import type { NotificationChannel, NotificationType } from './notification.types.js';

export interface CreateNotificationDto {
  bookingId?: string;
  paymentId?: string;
  ticketId?: string;
  recipientId: string;
  type: NotificationType;
  preferredChannels: NotificationChannel[];
  payload: Record<string, unknown>;
  sendAt?: string;
}

export interface NotificationWebhookEventDto {
  eventName:
    | 'notification.requested.v1'
    | 'notification.queued.v1'
    | 'notification.processing.v1'
    | 'notification.sent.v1'
    | 'notification.delivered.v1'
    | 'notification.failed.v1'
    | 'notification.dead_lettered.v1';
  notificationId: string;
  correlationId: string;
  occurredAt: string;
  context: Record<string, unknown>;
}

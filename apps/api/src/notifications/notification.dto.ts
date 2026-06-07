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

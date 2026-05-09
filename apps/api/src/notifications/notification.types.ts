import { NOTIFICATION_CHANNELS } from '../constants/index.js';

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];

export interface NotificationMessage {
  recipientId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

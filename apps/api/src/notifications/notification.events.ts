import { eventBus } from '../events/event-bus.js';
import { WS_EVENTS } from '../constants/app.constants.js';
import type { NotificationLifecycleState, NotificationType } from './notification.types.js';

export type NotificationPayload = {
  notificationId: string;
  bookingId?: string;
  audience: 'customer' | 'driver' | 'admin' | 'support' | 'business';
  type: NotificationType;
  channels: Array<'push' | 'email' | 'in_app' | 'sms' | 'whatsapp' | 'webhook'>;
  state: NotificationLifecycleState;
  message: string;
  occurredAt: string;
};

export const emitNotificationEvent = (payload: NotificationPayload): void => {
  eventBus.emit(WS_EVENTS.NOTIFICATION_CREATED, payload);
};

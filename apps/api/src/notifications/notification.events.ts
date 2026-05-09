import { eventBus } from '../events/event-bus.js';
import { WS_EVENTS } from '../constants/app.constants.js';

export type NotificationPayload = {
  notificationId: string;
  audience: 'customer' | 'driver' | 'admin';
  channels: Array<'push' | 'email' | 'in_app'>;
  message: string;
  occurredAt: string;
};

export const emitNotificationEvent = (payload: NotificationPayload): void => {
  eventBus.emit(WS_EVENTS.NOTIFICATION_CREATED, payload);
};

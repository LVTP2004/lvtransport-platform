import { eventBus } from '../events/event-bus.js';
import { WS_EVENTS } from '../constants/app.constants.js';
import type { NotificationEventEnvelope } from './notification.types.js';

export type NotificationPayload = NotificationEventEnvelope;

export const emitNotificationEvent = (payload: NotificationPayload): void => {
  eventBus.emit(WS_EVENTS.NOTIFICATION_CREATED, payload);
};

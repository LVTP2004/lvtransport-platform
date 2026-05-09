import { eventBus } from '../events/event-bus.js';
import { WS_EVENTS } from '../constants/app.constants.js';

export type DriverStatusPayload = {
  driverId: string;
  status: 'offline' | 'online' | 'busy';
  location?: { lat: number; lng: number };
  occurredAt: string;
};

export const emitDriverStatusEvent = (payload: DriverStatusPayload): void => {
  eventBus.emit(WS_EVENTS.DRIVER_STATUS_UPDATED, payload);
};

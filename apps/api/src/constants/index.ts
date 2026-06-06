export const APP_NAME = 'LV Transport API';

export const API_PREFIX = '/api';
export const API_VERSION = 'v1';

export const BOOKING_EVENTS = {
  CREATED: 'booking.created',
  ASSIGNED: 'booking.assigned',
  CANCELLED: 'booking.cancelled'
} as const;

export const DRIVER_EVENTS = {
  STATUS_UPDATED: 'driver.status.updated',
  LOCATION_UPDATED: 'driver.location.updated'
} as const;

export const TRACKING_EVENTS = {
  TRIP_STARTED: 'tracking.trip.started',
  LOCATION_PING: 'tracking.location.ping',
  TRIP_ENDED: 'tracking.trip.ended'
} as const;

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  PUSH: 'push',
  IN_APP: 'in_app'
} as const;


export const WS_EVENTS = {
  BOOKING_UPDATED: 'ws.booking.updated',
  DRIVER_UPDATED: 'ws.driver.updated'
} as const;

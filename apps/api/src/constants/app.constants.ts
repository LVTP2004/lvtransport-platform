export const API_PREFIX = '/api';
export const API_VERSION = 'v1';

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const WS_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  BOOKING_CREATED: 'booking.created',
  BOOKING_UPDATED: 'booking.updated',
  DRIVER_STATUS_UPDATED: 'driver.status.updated',
  TRACKING_LOCATION_UPDATED: 'tracking.location.updated',
  NOTIFICATION_CREATED: 'notification.created',
} as const;

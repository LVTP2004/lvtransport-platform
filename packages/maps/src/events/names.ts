export const MAP_EVENTS = {
  SESSION_CREATED: 'map.session.created',
  SESSION_UPDATED: 'map.session.updated',
  DRIVER_MARKER_UPDATED: 'map.driver.marker.updated',
  CUSTOMER_MARKER_UPDATED: 'map.customer.marker.updated',
  ROUTE_SYNC_REQUESTED: 'map.route.sync.requested',
  ROUTE_RECALCULATION_REQUESTED: 'map.route.recalculation.requested',
  ETA_UPDATED: 'map.eta.updated',
  PLAYBACK_STARTED: 'map.playback.started',
  PLAYBACK_STOPPED: 'map.playback.stopped',
  GEOFENCE_TRANSITION: 'map.geofence.transition',
} as const;

export type MapEventName = (typeof MAP_EVENTS)[keyof typeof MAP_EVENTS];

export const realtimeEventDomains = {
  booking: "booking",
  driver: "driver",
  tracking: "tracking",
  admin: "admin",
  notification: "notification",
  dispatch: "dispatch",
  chat: "chat"
} as const;

export const realtimeEvents = {
  BOOKING_UPDATED: "booking.updated.v1",
  BOOKING_LIFECYCLE_CHANGED: "booking.lifecycle_changed.v1",
  DRIVER_STATUS_CHANGED: "driver.status_changed.v1",
  DRIVER_LOCATION_UPDATED: "driver.location_updated.v1",
  TRACKING_STATE_CHANGED: "tracking.state_changed.v1",
  ETA_UPDATED: "tracking.eta_updated.v1",
  DISPATCH_CANDIDATE_PUSHED: "dispatch.candidate_pushed.v1",
  ADMIN_MONITORING_EVENT: "admin.monitoring_event.v1",
  NOTIFICATION_ENQUEUED: "notification.enqueued.v1",
  CHAT_MESSAGE_STUB: "chat.message_stub.v1"
} as const;

export type RealtimeEventName = (typeof realtimeEvents)[keyof typeof realtimeEvents];

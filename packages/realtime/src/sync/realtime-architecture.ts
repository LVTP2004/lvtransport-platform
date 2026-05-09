import { realtimeEvents } from "../events/names";

export const realtimeSynchronizationArchitecture = {
  gpsTracking: [realtimeEvents.DRIVER_LOCATION_UPDATED, realtimeEvents.ETA_UPDATED],
  dispatch: [realtimeEvents.DISPATCH_CANDIDATE_PUSHED, realtimeEvents.DRIVER_STATUS_CHANGED],
  booking: [realtimeEvents.BOOKING_UPDATED, realtimeEvents.BOOKING_LIFECYCLE_CHANGED],
  monitoring: [realtimeEvents.ADMIN_MONITORING_EVENT],
  notifications: [realtimeEvents.NOTIFICATION_ENQUEUED],
  futureChat: [realtimeEvents.CHAT_MESSAGE_STUB]
} as const;

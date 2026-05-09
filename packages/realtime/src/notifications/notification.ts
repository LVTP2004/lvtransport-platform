import { realtimeEvents } from "../events/names";

export const notificationArchitecture = {
  event: realtimeEvents.NOTIFICATION_ENQUEUED,
  queueCollection: "notification_queue",
  deliveryPath: "notifications/live/{userId}"
} as const;

import { realtimeEvents } from "../events/names.js";

export const notificationArchitecture = {
  event: realtimeEvents.NOTIFICATION_ENQUEUED,
  queueCollection: "notification_queue",
  deliveryPath: "notifications/live/{userId}"
} as const;

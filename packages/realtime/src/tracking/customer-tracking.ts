import { realtimeEvents } from "../events/names.js";

export const trackingStates = [
  "searching_driver",
  "driver_assigned",
  "accepted",
  "en_route",
  "arrived",
  "in_progress",
  "completed",
  "cancelled"
] as const;

export const customerTrackingStateArchitecture = {
  stateEnum: trackingStates,
  events: [realtimeEvents.TRACKING_STATE_CHANGED, realtimeEvents.ETA_UPDATED],
  livePath: "tracking/live/{bookingId}"
} as const;

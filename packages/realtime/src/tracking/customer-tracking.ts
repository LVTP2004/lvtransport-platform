import { realtimeEvents } from "../events/names.js";

export const trackingUiStates = [
  "searching_driver",
  "driver_assigned"
] as const;

export const trackingLifecycleStates = [
  "pending",
  "assigned",
  "accepted",
  "en_route",
  "arrived",
  "in_progress",
  "completed",
  "cancelled",
  "failed"
] as const;

export const customerTrackingStateArchitecture = {
  lifecycleStateEnum: trackingLifecycleStates,
  uiStateEnum: trackingUiStates,
  events: [realtimeEvents.TRACKING_STATE_CHANGED, realtimeEvents.ETA_UPDATED],
  livePath: "tracking/live/{bookingId}"
} as const;

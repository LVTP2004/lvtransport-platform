import { realtimeEvents } from "../events/names.js";
import { TrackingState } from "../models/enums.js";

export const customerTrackingStateArchitecture = {
  stateEnum: TrackingState,
  events: [realtimeEvents.TRACKING_STATE_CHANGED, realtimeEvents.ETA_UPDATED],
  livePath: "tracking/live/{bookingId}"
} as const;

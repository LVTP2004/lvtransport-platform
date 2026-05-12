import { realtimeEvents } from "../events/names.js";
import { DriverState } from "../models/enums.js";

export const driverLiveStatusArchitecture = {
  stateEnum: DriverState,
  events: [realtimeEvents.DRIVER_STATUS_CHANGED, realtimeEvents.DRIVER_LOCATION_UPDATED],
  presencePath: "drivers/live/{driverId}"
} as const;

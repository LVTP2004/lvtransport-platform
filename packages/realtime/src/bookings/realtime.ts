import { realtimeEvents } from "../events/names.js";
import { BookingLifecycle } from "../models/enums.js";

export const bookingRealtimeArchitecture = {
  lifecycleEnum: BookingLifecycle,
  events: [realtimeEvents.BOOKING_UPDATED, realtimeEvents.BOOKING_LIFECYCLE_CHANGED],
  firestoreCollection: "bookings",
  livePath: "bookings/live/{bookingId}"
} as const;

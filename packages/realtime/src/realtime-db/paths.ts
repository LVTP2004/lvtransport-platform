export const realtimeDbPaths = {
  driversLive: "drivers/live",
  bookingsLive: "bookings/live",
  trackingLive: "tracking/live",
  adminLiveDashboard: "admin/live_dashboard",
  notifications: "notifications/live",
  dispatch: "dispatch/live"
} as const;

export type RealtimeDbPath = (typeof realtimeDbPaths)[keyof typeof realtimeDbPaths];

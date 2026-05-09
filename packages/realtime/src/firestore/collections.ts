export const firestoreCollections = {
  bookings: "bookings",
  bookingEvents: "booking_events",
  drivers: "drivers",
  driverPresence: "driver_presence",
  trackingSessions: "tracking_sessions",
  adminMonitoringEvents: "admin_monitoring_events",
  notificationQueue: "notification_queue"
} as const;

export type FirestoreCollectionName = (typeof firestoreCollections)[keyof typeof firestoreCollections];

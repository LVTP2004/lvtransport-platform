import { realtimeEvents } from "../events/names.js";

export const adminMonitoringEventArchitecture = {
  events: [realtimeEvents.ADMIN_MONITORING_EVENT],
  firestoreCollection: "admin_monitoring_events",
  realtimePath: "admin/live_dashboard"
} as const;

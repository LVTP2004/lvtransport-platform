import { BookingLifecycle, DriverState, TrackingState } from "./enums.js";

export interface Coordinates {
  lat: number;
  lng: number;
  heading?: number;
  speedKph?: number;
  accuracyMeters?: number;
  source?: "gps" | "network" | "manual";
}

export interface DriverLiveStatus {
  driverId: string;
  state: DriverState;
  position?: Coordinates;
  updatedAt: string;
}

export interface BookingRealtimeState {
  bookingId: string;
  lifecycle: BookingLifecycle;
  trackingState: TrackingState;
  etaSeconds?: number;
  assignedDriverId?: string;
  updatedAt: string;
}

export interface AdminMonitoringEvent {
  eventId: string;
  eventName: string;
  severity: "info" | "warning" | "critical";
  entityType: "booking" | "driver" | "system" | "tracking";
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface CustomerTrackingState {
  customerId: string;
  bookingId: string;
  trackingState: TrackingState;
  driverStatus?: DriverLiveStatus;
  bookingState?: BookingRealtimeState;
  updatedAt: string;
}

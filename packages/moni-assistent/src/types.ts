export type BookingStatus =
  | "pending"
  | "validated"
  | "priced"
  | "assigned"
  | "accepted"
  | "on_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "issue";

export type DriverAvailability = "offline" | "available" | "busy";

export type AdminInterventionReason =
  | "validation_failed"
  | "pricing_unavailable"
  | "driver_not_found"
  | "driver_stalled"
  | "booking_issue";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BookingRequest {
  customerId: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupCoordinates?: Coordinates;
  dropoffCoordinates?: Coordinates;
  scheduledAt?: string;
  requestedVehicleType?: string;
  notes?: string;
}

export interface BookingRecord {
  id: string;
  request: BookingRequest;
  status: BookingStatus;
  estimatedPrice?: number;
  trackingCode?: string;
  assignedDriverId?: string;
  issueMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverStatusUpdate {
  bookingId: string;
  driverId: string;
  status:
    | "accepted"
    | "on_route"
    | "arrived"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "issue";
  message?: string;
  timestamp: string;
}

export interface BookingValidationResult {
  valid: boolean;
  reason?: string;
}

export interface PriceEstimate {
  amount: number;
  currency: string;
  confidence?: number;
}

export interface DriverCandidate {
  driverId: string;
  availability: DriverAvailability;
  distanceKm?: number;
}

export interface BookingFlowDependencies {
  now?: () => string;
  validateBooking: (request: BookingRequest) => Promise<BookingValidationResult>;
  estimatePrice: (request: BookingRequest) => Promise<PriceEstimate>;
  generateTrackingCode: (bookingId: string) => string;
  requestDriverAssignment: (booking: BookingRecord) => Promise<DriverCandidate | null>;
}

export type NotificationAudience = "customer" | "driver";

export interface NotificationEvent {
  audience: NotificationAudience;
  recipientId: string;
  bookingId: string;
  status: BookingStatus;
  message: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface AdminAlert {
  bookingId: string;
  reason: AdminInterventionReason;
  message: string;
  timestamp: string;
}

export interface DispatchOutcome {
  booking: BookingRecord;
  notifications: NotificationEvent[];
  adminAlert?: AdminAlert;
}

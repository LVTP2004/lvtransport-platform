import type {
  AdminAlert,
  BookingFlowDependencies,
  BookingRecord,
  BookingRequest,
  DispatchOutcome,
  DriverCandidate,
} from "./types";
import { buildCustomerStatusNotification, buildDriverAssignmentNotification } from "./notifications";

const nowIso = () => new Date().toISOString();

const newBookingRecord = (id: string, request: BookingRequest, now: string): BookingRecord => ({
  id,
  request,
  status: "pending",
  createdAt: now,
  updatedAt: now,
});

export const startBookingFlow = async (
  bookingId: string,
  request: BookingRequest,
  deps: BookingFlowDependencies
): Promise<DispatchOutcome> => {
  const now = deps.now ?? nowIso;
  const booking = newBookingRecord(bookingId, request, now());

  const validation = await deps.validateBooking(request);
  if (!validation.valid) {
    booking.status = "issue";
    booking.issueMessage = validation.reason ?? "Booking validation failed.";
    booking.updatedAt = now();

    return {
      booking,
      notifications: [buildCustomerStatusNotification(booking, "We need a quick review before proceeding.")],
      adminAlert: createAdminAlert(booking, "validation_failed", booking.issueMessage, now()),
    };
  }

  booking.status = "validated";
  booking.updatedAt = now();

  try {
    const price = await deps.estimatePrice(request);
    booking.estimatedPrice = price.amount;
    booking.status = "priced";
    booking.updatedAt = now();
  } catch (error) {
    const pricingMessage =
      error instanceof Error && error.message ? error.message : "Pricing service unavailable during booking.";

    booking.status = "issue";
    booking.issueMessage = pricingMessage;
    booking.updatedAt = now();

    return {
      booking,
      notifications: [buildCustomerStatusNotification(booking, "We're reviewing your fare before dispatching a driver.")],
      adminAlert: createAdminAlert(booking, "pricing_unavailable", pricingMessage, now()),
    };
  }

  booking.trackingCode = deps.generateTrackingCode(booking.id);

  const candidate = await deps.requestDriverAssignment(booking);
  if (!candidate || candidate.availability !== "available") {
    booking.status = "issue";
    booking.issueMessage = "No available driver accepted the booking yet.";
    booking.updatedAt = now();

    return {
      booking,
      notifications: [buildCustomerStatusNotification(booking, "We are still searching for a driver.")],
      adminAlert: createAdminAlert(booking, "driver_not_found", booking.issueMessage, now()),
    };
  }

  applyAssignedDriver(booking, candidate, now());

  return {
    booking,
    notifications: [
      buildCustomerStatusNotification(booking, "Driver assignment in progress."),
      buildDriverAssignmentNotification(booking),
    ],
  };
};

const applyAssignedDriver = (booking: BookingRecord, candidate: DriverCandidate, timestamp: string) => {
  booking.assignedDriverId = candidate.driverId;
  booking.status = "assigned";
  booking.updatedAt = timestamp;
};

const createAdminAlert = (
  booking: BookingRecord,
  reason: AdminAlert["reason"],
  message: string,
  timestamp: string
): AdminAlert => ({
  bookingId: booking.id,
  reason,
  message,
  timestamp,
});

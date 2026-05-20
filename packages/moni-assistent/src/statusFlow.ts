import type { AdminAlert, BookingRecord, DriverStatusUpdate } from "./types";
import { buildCustomerStatusNotification } from "./notifications";

const statusTransitions: Record<BookingRecord["status"], BookingRecord["status"][]> = {
  pending: ["validated", "cancelled", "issue"],
  validated: ["priced", "cancelled", "issue"],
  priced: ["assigned", "cancelled", "issue"],
  assigned: ["accepted", "cancelled", "issue"],
  accepted: ["en_route", "cancelled", "issue"],
  en_route: ["arrived", "cancelled", "issue"],
  arrived: ["in_progress", "cancelled", "issue"],
  in_progress: ["completed", "cancelled", "issue"],
  completed: [],
  cancelled: [],
  issue: ["assigned", "cancelled"],
};

export const applyDriverStatusUpdate = (
  booking: BookingRecord,
  update: DriverStatusUpdate
): { booking: BookingRecord; notification: ReturnType<typeof buildCustomerStatusNotification>; adminAlert?: AdminAlert } => {
  const nextStatus = update.status;
  const allowedStatuses = statusTransitions[booking.status];

  if (!allowedStatuses.includes(nextStatus)) {
    booking.status = "issue";
    booking.issueMessage = `Invalid status transition: ${booking.status} -> ${nextStatus}`;
    booking.updatedAt = update.timestamp;

    return {
      booking,
      notification: buildCustomerStatusNotification(booking, "A dispatcher is reviewing your trip status."),
      adminAlert: {
        bookingId: booking.id,
        reason: "booking_issue",
        message: booking.issueMessage,
        timestamp: update.timestamp,
      },
    };
  }

  booking.status = nextStatus;
  booking.updatedAt = update.timestamp;
  if (nextStatus === "issue") {
    booking.issueMessage = update.message ?? "Driver reported an issue requiring manual review.";
  }

  const statusMessage = update.message ?? `Trip status updated to ${nextStatus.replace("_", " ")}.`;

  return {
    booking,
    notification: buildCustomerStatusNotification(booking, statusMessage),
    adminAlert:
      nextStatus === "issue"
        ? {
            bookingId: booking.id,
            reason: "booking_issue",
            message: booking.issueMessage ?? statusMessage,
            timestamp: update.timestamp,
          }
        : undefined,
  };
};

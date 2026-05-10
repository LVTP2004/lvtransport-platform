import type { BookingRecord, NotificationEvent } from "./types";

export const buildCustomerStatusNotification = (
  booking: BookingRecord,
  message: string
): NotificationEvent => ({
  audience: "customer",
  recipientId: booking.request.customerId,
  bookingId: booking.id,
  status: booking.status,
  message,
  metadata: {
    trackingCode: booking.trackingCode ?? null,
    estimatedPrice: booking.estimatedPrice ?? null,
  },
});

export const buildDriverAssignmentNotification = (booking: BookingRecord): NotificationEvent => ({
  audience: "driver",
  recipientId: booking.assignedDriverId ?? "",
  bookingId: booking.id,
  status: booking.status,
  message: "You have a new booking assignment request.",
  metadata: {
    pickupAddress: booking.request.pickupAddress,
    dropoffAddress: booking.request.dropoffAddress,
  },
});

type BookingInput = {
  customerId: string;
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number;
};

type BookingRecord = BookingInput & {
  id: string;
  trackingCode: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
};

const bookings = new Map<string, BookingRecord>();

export const bookingEngineService = {
  createBooking(input: BookingInput) {
    const now = new Date().toISOString();
    const booking: BookingRecord = {
      ...input,
      id: `booking-${Date.now()}`,
      trackingCode: `LVTP-${Date.now().toString(36).toUpperCase()}`,
      status: 'pending',
      createdAt: now,
    };
    bookings.set(booking.id, booking);
    return booking;
  },

  listBookings() {
    return [...bookings.values()];
  },

  findByTrackingCode(code: string) {
    return [...bookings.values()].find((booking) => booking.trackingCode === code) ?? null;
  },

  respondToRide(bookingId: string, driverId: string, action: 'accept' | 'reject') {
    const booking = bookings.get(bookingId);
    if (!booking) return null;

    const next: BookingRecord = {
      ...booking,
      status: action === 'accept' ? 'accepted' : 'rejected',
    };

    bookings.set(bookingId, next);
    return { booking: next, driverId, action };
  },
};

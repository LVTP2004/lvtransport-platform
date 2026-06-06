export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'driver_assigned'
  | 'driver_on_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type BookingRecord = {
  bookingId: string;
  customerId: string;
  pickup: string;
  destination: string;
  status: BookingStatus;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
};

const bookings = new Map<string, BookingRecord>();

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const bookingsService = {
  createBooking(input: { customerId: string; pickup: string; destination: string }): BookingRecord {
    const now = new Date().toISOString();
    const booking: BookingRecord = {
      bookingId: id('bk'),
      customerId: input.customerId,
      pickup: input.pickup,
      destination: input.destination,
      status: 'pending',
      trackingCode: id('trk').toUpperCase(),
      createdAt: now,
      updatedAt: now
    };

    bookings.set(booking.bookingId, booking);
    return booking;
  },

  listBookings(): BookingRecord[] {
    return [...bookings.values()];
  },

  getBooking(bookingId: string): BookingRecord | undefined {
    return bookings.get(bookingId);
  },

  updateStatus(bookingId: string, status: BookingStatus): BookingRecord | undefined {
    const booking = bookings.get(bookingId);
    if (!booking) return undefined;

    const next = {
      ...booking,
      status,
      updatedAt: new Date().toISOString()
    };

    bookings.set(bookingId, next);
    return next;
  },

  findByTrackingCode(trackingCode: string): BookingRecord | undefined {
    return [...bookings.values()].find((booking) => booking.trackingCode === trackingCode);
  }
};

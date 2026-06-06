import type { Booking } from '../types/booking.types.js';

const bookings: Booking[] = [];

export const bookingRepository = {
  create(booking: Booking) {
    bookings.unshift(booking);
    return booking;
  },
  list() {
    return [...bookings];
  },
};

import { bookingsService, type BookingStatus } from './bookings/bookings.service.js';
import { trackingService } from './tracking/tracking.service.js';

export type RouteResponse = {
  ok: boolean;
  service: string;
  version: string;
  mode: string;
  time: string;
};

export function createApp() {
  return {
    health(): RouteResponse {
      return {
        ok: true,
        service: '@lvtransport/api',
        version: '0.1.0',
        mode: 'safe-bookings-baseline',
        time: new Date().toISOString()
      };
    },

    createBooking(input: { customerId: string; pickup: string; destination: string }) {
      return bookingsService.createBooking(input);
    },

    listBookings() {
      return bookingsService.listBookings();
    },

    updateBookingStatus(bookingId: string, status: BookingStatus) {
      return bookingsService.updateStatus(bookingId, status);
    },

    track(code: string) {
      return trackingService.findByCode(code);
    }
  };
}

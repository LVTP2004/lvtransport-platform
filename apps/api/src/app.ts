import { bookingEngineService } from './bookings/booking-engine.service.js';

export function createApp() {
  return {
    health() {
      return {
        ok: true,
        service: '@lvtransport/api',
        version: '0.1.0',
        mode: 'booking-engine-baseline',
        time: new Date().toISOString()
      };
    },

    createBooking(input: {
      customerId: string;
      pickupAddress: string;
      dropoffAddress: string;
      distanceKm: number;
    }) {
      return bookingEngineService.createBooking(input);
    },

    listBookings() {
      return bookingEngineService.listBookings();
    },

    track(code: string) {
      return bookingEngineService.findByTrackingCode(code);
    },

    driverResponse(bookingId: string, driverId: string, action: 'accept' | 'reject') {
      return bookingEngineService.respondToRide(bookingId, driverId, action);
    }
  };
}

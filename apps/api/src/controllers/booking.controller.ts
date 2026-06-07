import { createApp } from '../app.js';

const app = createApp() as any;

export const createBookingController = (input: {
  customerId: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  pickup?: string;
  destination?: string;
  distanceKm?: number;
}) => {
  return app.createBooking({
    customerId: input.customerId,
    pickupAddress: input.pickupAddress ?? input.pickup ?? 'unknown-pickup',
    dropoffAddress: input.dropoffAddress ?? input.destination ?? 'unknown-destination',
    distanceKm: input.distanceKm ?? 0
  });
};

export const listBookingsController = () => app.listBookings();

export const updateBookingLifecycleController = (
  bookingId: string,
  driverId: string,
  action: 'accept' | 'reject'
) => app.respondToRide(bookingId, driverId, action);

export const bookingMetricsController = () => ({
  totalBookings: app.listBookings().length,
  time: new Date().toISOString()
});

export const bookingAirportIntelligenceController = (bookingId: string) => ({
  bookingId,
  airportIntelligence: null,
  mode: 'safe-controller-baseline'
});

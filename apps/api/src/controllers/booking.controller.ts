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
    dropoffAddress: input.dropoffAddress ?? input.destination ?? 'unknown-dropoff',
    distanceKm: input.distanceKm ?? 0
  });
};

export const listBookingsController = () => {
  return app.listBookings();
};

export const bookingMetricsController = () => {
  return {
    totalBookings: app.listBookings().length
  };
};

export const updateBookingLifecycleController = (bookingId: string, action: 'accept' | 'reject', driverId = 'system') => {
  return app.respondToRide(bookingId, driverId, action);
};

export const bookingAirportIntelligenceController = (bookingId: string) => {
  return {
    bookingId,
    airportIntelligence: null,
    mode: 'safe-baseline'
  };
};

import { createApp } from '../../app.js';

const app = createApp() as any;

export const bookingRoutes = {
  create(input: unknown) {
    return app.createBooking(input);
  },

  list() {
    return app.listBookings();
  }
};

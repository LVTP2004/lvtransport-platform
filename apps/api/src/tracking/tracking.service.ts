import { bookingsService } from '../bookings/bookings.service.js';

export const trackingService = {
  findByCode(code: string) {
    return bookingsService.findByTrackingCode(code);
  }
};

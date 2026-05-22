import { Router } from 'express';
import { bookingAirportIntelligenceController, bookingMetricsController, createBookingController, listBookingsController, updateBookingLifecycleController } from '../../controllers/booking.controller.js';

const router = Router();

router.post('/bookings', createBookingController);
router.get('/admin/bookings', listBookingsController);
router.get('/admin/bookings/:bookingId/airport-intelligence', bookingAirportIntelligenceController);
router.patch('/admin/bookings/:bookingId/lifecycle', updateBookingLifecycleController);
router.get('/admin/bookings/metrics', bookingMetricsController);

export default router;

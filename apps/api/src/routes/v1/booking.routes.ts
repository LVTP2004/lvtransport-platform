import { Router } from 'express';
import { bookingMetricsController, createBookingController, listBookingsController, updateBookingLifecycleController } from '../../controllers/booking.controller.js';

const router = Router();

router.post('/bookings', createBookingController);
router.get('/admin/bookings', listBookingsController);
router.patch('/admin/bookings/:bookingId/lifecycle', updateBookingLifecycleController);
router.get('/admin/bookings/metrics', bookingMetricsController);

export default router;

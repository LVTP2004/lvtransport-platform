import { Router } from 'express';
import { createBookingController, listBookingsController } from '../../controllers/booking.controller.js';

const router = Router();

router.post('/bookings', createBookingController);
router.get('/bookings', listBookingsController);

export default router;

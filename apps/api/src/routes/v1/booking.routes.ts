import { Router } from 'express';
import { createBookingController, listBookingsController } from '../../controllers/booking.controller.js';

const router = Router();

router.post('/bookings', createBookingController);
router.get('/bookings', listBookingsController);
import { createBookingHandler, listBookingsHandler } from '../../controllers/booking.controller.js';

const router = Router();

router.post('/', createBookingHandler);
router.get('/', listBookingsHandler);

export default router;

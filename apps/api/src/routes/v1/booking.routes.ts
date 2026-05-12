import { Router } from 'express';
import { createBookingHandler, listBookingsHandler } from '../../controllers/booking.controller.js';

const router = Router();

router.post('/', createBookingHandler);
router.get('/', listBookingsHandler);

export default router;

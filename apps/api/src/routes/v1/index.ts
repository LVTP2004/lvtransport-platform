import { Router } from 'express';
import healthRoutes from './health.routes.js';
import bookingRoutes from './booking.routes.js';
import bookingsRoutes from './bookings.routes.js';

const router = Router();

router.use(healthRoutes);
router.use('/bookings', bookingRoutes);
router.use(bookingsRoutes);

export default router;

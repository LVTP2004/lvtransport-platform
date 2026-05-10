import { Router } from 'express';
import healthRoutes from './health.routes.js';
import bookingsRoutes from './bookings.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(bookingsRoutes);

export default router;

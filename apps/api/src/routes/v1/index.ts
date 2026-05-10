import { Router } from 'express';
import healthRoutes from './health.routes.js';
import bookingRoutes from './booking.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(bookingRoutes);

export default router;

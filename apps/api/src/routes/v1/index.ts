import { Router } from 'express';
import healthRoutes from './health.routes.js';
import customerBookingRoutes from './customer-booking.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use(customerBookingRoutes);

export default router;

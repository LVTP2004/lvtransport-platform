import { Router } from 'express';
import healthRoutes from './health.routes.js';
import trackingRoutes from './tracking.routes.js';
import notificationRoutes from './notifications.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(trackingRoutes);
router.use(notificationRoutes);

export default router;

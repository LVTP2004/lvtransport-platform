import { Router } from 'express';
import healthRoutes from './health.routes.js';
import trackingRoutes from './tracking.routes.js';
import notificationRoutes from './notifications.routes.js';
import mapsRoutes from './maps.routes.js';
import bookingRoutes from './booking.routes.js';
import bookingsRoutes from './bookings.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(trackingRoutes);
router.use(notificationRoutes);
router.use(mapsRoutes);
router.use(bookingRoutes);
router.use('/bookings', bookingRoutes);
router.use(bookingsRoutes);

export default router;

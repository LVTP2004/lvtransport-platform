import { Router } from 'express';
import healthRoutes from './health.routes.js';
import mapsRoutes from './maps.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(mapsRoutes);

export default router;

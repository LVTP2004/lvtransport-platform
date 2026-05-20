import { Router } from 'express';
import healthRoutes from './health.routes.js';
import mapsRoutes from '../../modules/maps/routes/maps.routes.js';

const router = Router();

router.use(healthRoutes);
router.use('/maps', mapsRoutes);

export default router;

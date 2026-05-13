import { Router } from 'express';
import { healthController, readinessController } from '../../controllers/health.controller.js';

const router = Router();

router.get('/health', healthController);
router.get('/health/readiness', readinessController);

export default router;

import { Router } from 'express';
import { healthController, readinessController, startupValidationController } from '../../controllers/health.controller.js';

const router = Router();

router.get('/health', healthController);
router.get('/health/readiness', readinessController);
router.get('/health/startup-validation', startupValidationController);

export default router;

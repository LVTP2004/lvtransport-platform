import { Router } from 'express';
import { healthController, readinessController, startupValidationController } from '../../controllers/health.controller.js';

const router = Router();

router.get('/', healthController);
router.get('/readiness', readinessController);
router.get('/startup-validation', startupValidationController);

export default router;

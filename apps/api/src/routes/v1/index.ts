import { Router } from 'express';
import healthRoutes from './health.routes.js';
import paymentRoutes from '../../modules/payments/payment.routes.js';

const router = Router();

router.use(healthRoutes);
router.use('/payments', paymentRoutes);

export default router;

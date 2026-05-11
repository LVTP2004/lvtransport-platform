import { Router } from 'express';
import healthRoutes from './health.routes.js';
import { realtimeOrchestratorService } from '../../services/realtime-orchestrator.service.js';

const router = Router();

router.use(healthRoutes);

router.get('/bookings', (_req, res) => {
  res.json({ bookings: realtimeOrchestratorService.listBookings() });
});

router.post('/bookings', (req, res, next) => {
  try {
    const booking = realtimeOrchestratorService.createBooking(req.body);
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
});

router.post('/bookings/:bookingId/assign-driver', (req, res, next) => {
  try {
    const booking = realtimeOrchestratorService.assignDriver({ bookingId: req.params.bookingId, ...req.body });
    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

router.post('/bookings/:bookingId/status', (req, res, next) => {
  try {
    const booking = realtimeOrchestratorService.transitionStatus({ bookingId: req.params.bookingId, ...req.body });
    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

export default router;

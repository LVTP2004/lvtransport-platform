import { Router } from 'express';
import healthRoutes from './health.routes.js';
import paymentRoutes from '../../modules/payments/payment.routes.js';
import { realtimeOrchestratorService } from '../../services/realtime-orchestrator.service.js';
import trackingRoutes from './tracking.routes.js';
import notificationRoutes from './notifications.routes.js';
import mapsRoutes from './maps.routes.js';
import bookingRoutes from './booking.routes.js';
import { operationalAnalyticsService } from '../../services/operational-analytics.service.js';
import { listOperationalIncidents } from '../../utils/operational-monitoring.js';
import { integrationReadinessService } from '../../services/integration-readiness.service.js';
import { HttpError } from '../../utils/http-error.js';

const router = Router();
const ASSIGNMENT_ERROR_STATUS: Record<string, { statusCode: number; message: string }> = {
  BOOKING_NOT_FOUND: { statusCode: 404, message: 'Booking not found' },
  BOOKING_ALREADY_ASSIGNED: { statusCode: 409, message: 'Booking already assigned to another driver' },
  DRIVER_NOT_AVAILABLE: { statusCode: 409, message: 'Driver is not available for assignment' },
  INVALID_ASSIGNMENT_STATE: { statusCode: 409, message: 'Booking assignment state is invalid' },
  INVALID_TRANSITION: { statusCode: 409, message: 'Invalid assignment transition' },
  DUPLICATE_ASSIGNMENT_ATTEMPT: { statusCode: 409, message: 'Duplicate assignment attempt' },
};

const normalizeAssignmentError = (error: unknown): Error => {
  if (!(error instanceof Error)) return new HttpError(500, 'An unexpected error occurred', 'INTERNAL_SERVER_ERROR');
  const mapped = ASSIGNMENT_ERROR_STATUS[error.message];
  if (!mapped) return error;
  return new HttpError(mapped.statusCode, mapped.message, error.message);
};
router.use(healthRoutes);
router.use('/payments', paymentRoutes);
router.use(trackingRoutes);
router.use(notificationRoutes);
router.use(mapsRoutes);
router.use(bookingRoutes);

router.post('/bookings/:bookingId/assign-driver', (req, res, next) => {
  try {
    const booking = realtimeOrchestratorService.assignDriver({ bookingId: req.params.bookingId, ...req.body });
    res.json({ booking });
  } catch (error) {
    next(normalizeAssignmentError(error));
  }
});

router.post('/bookings/:bookingId/assign-driver/preparation', (req, res, next) => {
  try {
    const assignmentPreparation = realtimeOrchestratorService.prepareDriverAssignment({
      bookingId: req.params.bookingId,
      pickupLocation: req.body.pickupLocation
    });
    res.json({ assignmentPreparation });
  } catch (error) {
    next(error);
  }
});


router.post('/bookings/:bookingId/driver-response', (req, res, next) => {
  try {
    const booking = realtimeOrchestratorService.driverRespondToAssignment({ bookingId: req.params.bookingId, ...req.body });
    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

router.post('/dispatch/cleanup-stale-assignments', (_req, res) => {
  res.json(realtimeOrchestratorService.cleanupStaleAssignments());
});

router.get('/dispatch/diagnostics', (_req, res) => {
  res.json(realtimeOrchestratorService.getDispatchDiagnostics());
});
router.get('/operations/diagnostics', (_req, res) => {
  res.json(realtimeOrchestratorService.getOperationalDiagnostics());
});
router.get('/operations/incidents', (_req, res) => {
  res.json({ incidents: listOperationalIncidents() });
});

router.post('/drivers/:driverId/restore-assignments', (req, res) => {
  res.json(realtimeOrchestratorService.restoreDriverAssignments(req.params.driverId));
});

router.post('/bookings/:bookingId/status', (req, res, next) => {
  try {
    const requestedStatus = typeof req.body?.status === 'string' ? req.body.status : req.body?.nextStatus;
    const actor = typeof req.body?.actor === 'string' ? req.body.actor : undefined;
    if (!requestedStatus || !actor) {
      return res.status(400).json({ message: 'status and actor are required' });
    }
    const booking = realtimeOrchestratorService.transitionStatus({
      bookingId: req.params.bookingId,
      status: requestedStatus,
      actor,
      expectedVersion: typeof req.body?.expectedVersion === 'number' ? req.body.expectedVersion : undefined,
      idempotencyKey: typeof req.body?.idempotencyKey === 'string' ? req.body.idempotencyKey : undefined,
      eventAt: typeof req.body?.eventAt === 'string' ? req.body.eventAt : undefined
    });
    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

router.get('/drivers/live-states', (_req, res) => {
  res.json({ drivers: realtimeOrchestratorService.listDriverStates() });
});

router.post('/drivers/:driverId/status', (req, res, next) => {
  try {
    const driver = realtimeOrchestratorService.updateDriverState({ driverId: req.params.driverId, ...req.body });
    res.json({ driver });
  } catch (error) {
    next(error);
  }
});


router.get('/admin/analytics/operational-snapshot', (_req, res) => {
  res.json({ analytics: operationalAnalyticsService.getAdminSnapshot() });
});

router.get('/admin/analytics/diagnostics', (_req, res) => {
  const snapshot = operationalAnalyticsService.getAdminSnapshot();
  res.json({
    synchronizedRevenueBookings: snapshot.revenueTracking.synchronizedBookingIds.length,
    completionRate: snapshot.bookingAnalytics.completionRate,
    trackedBusinessAccounts: snapshot.businessAccounts.trackedAccounts,
    dispatchAcceptanceRate: snapshot.dispatchEfficiency.acceptanceRate
  });
});
router.get('/admin/integrations/readiness', (_req, res) => {
  res.json({ readiness: integrationReadinessService.getSnapshot() });
});

router.post('/drivers/:driverId/location', (req, res, next) => {
  try {
    const driver = realtimeOrchestratorService.updateDriverLocation({ driverId: req.params.driverId, ...req.body });
    res.json({ driver });
  } catch (error) {
    next(error);
  }
});

export default router;

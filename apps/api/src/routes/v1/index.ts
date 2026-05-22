import { Router } from 'express';
import { founderRoutes } from './founder.routes.js';
import healthRoutes from './health.routes.js';
import paymentRoutes from '../../modules/payments/payment.routes.js';
import { realtimeOrchestratorService } from '../../services/realtime-orchestrator.service.js';
import trackingRoutes from './tracking.routes.js';
import notificationRoutes from './notifications.routes.js';
import mapsRoutes from './maps.routes.js';
import bookingRoutes from './booking.routes.js';
import persistenceRoutes from './persistence.routes.js';
import executionRoutes from './execution.routes.js';
import operationsExecutionRoutes from './operations-execution.routes.js';
import { operationalAnalyticsService } from '../../services/operational-analytics.service.js';
import { listOperationalIncidents } from '../../utils/operational-monitoring.js';
import { integrationReadinessService } from '../../services/integration-readiness.service.js';
import { HttpError } from '../../utils/http-error.js';

const router = Router();

const OPERATIONAL_ERROR_STATUS: Record<string, { statusCode: number; message: string }> = {
  BOOKING_NOT_FOUND: { statusCode: 404, message: 'Booking not found' },
  DRIVER_NOT_FOUND: { statusCode: 404, message: 'Driver not found' },
  BOOKING_ALREADY_ASSIGNED: { statusCode: 409, message: 'Booking already assigned to another driver' },
  INVALID_ASSIGNMENT_STATE: { statusCode: 409, message: 'Booking assignment state is invalid' },
  INVALID_TRANSITION: { statusCode: 409, message: 'Invalid lifecycle transition requested' },
  TERMINAL_STATE_IMMUTABLE: { statusCode: 409, message: 'Booking is already in terminal state and cannot be mutated' },
  DUPLICATE_ASSIGNMENT_ATTEMPT: { statusCode: 409, message: 'Duplicate assignment attempt ignored' },
  STALE_EVENT_REJECTED: { statusCode: 409, message: 'Stale lifecycle event rejected' },
  DRIVER_MISMATCH: { statusCode: 409, message: 'Driver is not authorized for this assignment' },
  ASSIGNMENT_EXPIRED: { statusCode: 409, message: 'Assignment offer has expired' },
  DRIVER_NOT_AVAILABLE: { statusCode: 409, message: 'Driver is not available for assignment' },
  INVALID_ACTOR: { statusCode: 400, message: 'Invalid lifecycle actor supplied' },
  INVALID_DRIVER_STATE: { statusCode: 400, message: 'Invalid driver state supplied' },
  INVALID_TELEMETRY_COORDINATES: { statusCode: 400, message: 'Invalid driver telemetry coordinates' }
};

const normalizeOperationalError = (error: unknown): Error => {
  if (!(error instanceof Error)) return new HttpError(500, 'An unexpected error occurred', 'INTERNAL_SERVER_ERROR');
  const mapped = OPERATIONAL_ERROR_STATUS[error.message];
  if (!mapped) return error;
  return new HttpError(mapped.statusCode, mapped.message, error.message);
};

router.use(healthRoutes);
router.use('/maps', mapsRoutes);
router.use('/payments', paymentRoutes);
router.use(trackingRoutes);
router.use(notificationRoutes);
router.use(mapsRoutes);
router.use(bookingRoutes);
router.use(persistenceRoutes);
router.use(executionRoutes);
router.use(operationsExecutionRoutes);

router.post('/bookings/:bookingId/assign-driver', (req, res, next) => {
  try { res.json({ booking: realtimeOrchestratorService.assignDriver({ bookingId: req.params.bookingId, ...req.body }) }); }
  catch (error) { next(normalizeOperationalError(error)); }
});

router.post('/bookings/:bookingId/assign-driver/preparation', (req, res, next) => {
  try {
    const assignmentPreparation = realtimeOrchestratorService.prepareDriverAssignment({ bookingId: req.params.bookingId, pickupLocation: req.body.pickupLocation });
    res.json({ assignmentPreparation });
  } catch (error) { next(normalizeOperationalError(error)); }
});

router.post('/bookings/:bookingId/driver-response', (req, res, next) => {
  try { res.json({ booking: realtimeOrchestratorService.driverRespondToAssignment({ bookingId: req.params.bookingId, ...req.body }) }); }
  catch (error) { next(normalizeOperationalError(error)); }
});

router.post('/dispatch/cleanup-stale-assignments', (_req, res) => { res.json(realtimeOrchestratorService.cleanupStaleAssignments()); });
router.get('/dispatch/diagnostics', (_req, res) => { res.json(realtimeOrchestratorService.getDispatchDiagnostics()); });
router.get('/operations/diagnostics', (_req, res) => { res.json(realtimeOrchestratorService.getOperationalDiagnostics()); });
router.get('/operations/incidents', (_req, res) => { res.json({ incidents: listOperationalIncidents() }); });

router.post('/drivers/:driverId/restore-assignments', (req, res) => { res.json(realtimeOrchestratorService.restoreDriverAssignments(req.params.driverId)); });

router.post('/bookings/:bookingId/status', (req, res, next) => {
  try {
    const requestedStatus = typeof req.body?.status === 'string' ? req.body.status : req.body?.nextStatus;
    const actor = typeof req.body?.actor === 'string' ? req.body.actor : undefined;
    if (!requestedStatus || !actor) return next(new HttpError(400, 'status and actor are required', 'INVALID_TRANSITION'));
    const booking = realtimeOrchestratorService.transitionStatus({
      bookingId: req.params.bookingId,
      status: requestedStatus,
      actor,
      expectedVersion: typeof req.body?.expectedVersion === 'number' ? req.body.expectedVersion : undefined,
      idempotencyKey: typeof req.body?.idempotencyKey === 'string' ? req.body.idempotencyKey : undefined,
      eventAt: typeof req.body?.eventAt === 'string' ? req.body.eventAt : undefined
    });
    res.json({ booking });
  } catch (error) { next(normalizeOperationalError(error)); }
});

router.get('/drivers/live-states', (_req, res) => { res.json({ drivers: realtimeOrchestratorService.listDriverStates() }); });
router.post('/drivers/:driverId/status', (req, res, next) => {
  try { res.json({ driver: realtimeOrchestratorService.updateDriverState({ driverId: req.params.driverId, ...req.body }) }); }
  catch (error) { next(normalizeOperationalError(error)); }
});

router.get('/admin/analytics/operational-snapshot', (_req, res) => { res.json({ analytics: operationalAnalyticsService.getAdminSnapshot() }); });
router.get('/admin/analytics/diagnostics', (_req, res) => {
  const snapshot = operationalAnalyticsService.getAdminSnapshot();
  res.json({
    synchronizedRevenueBookings: snapshot.revenueTracking.synchronizedBookingIds.length,
    completionRate: snapshot.bookingAnalytics.completionRate,
    trackedBusinessAccounts: snapshot.businessAccounts.trackedAccounts,
    dispatchAcceptanceRate: snapshot.dispatchEfficiency.acceptanceRate
  });
});
router.get('/admin/integrations/readiness', (_req, res) => { res.json({ readiness: integrationReadinessService.getSnapshot() }); });

router.post('/drivers/:driverId/location', (req, res, next) => {
  try { res.json({ driver: realtimeOrchestratorService.updateDriverLocation({ driverId: req.params.driverId, ...req.body }) }); }
  catch (error) { next(normalizeOperationalError(error)); }
});

export default router;


router.use(founderRoutes);

import { Router } from 'express';
import healthRoutes from './health.routes.js';
import paymentRoutes from '../../modules/payments/payment.routes.js';
import { realtimeOrchestratorService } from '../../services/realtime-orchestrator.service.js';
import trackingRoutes from './tracking.routes.js';
import notificationRoutes from './notifications.routes.js';
import mapsRoutes from './maps.routes.js';
import bookingRoutes from './booking.routes.js';
import bookingsRoutes from './bookings.routes.js';
import { incidentManagementService } from '../../services/incident-management.service.js';

const router = Router();
router.use(healthRoutes);
router.use('/payments', paymentRoutes);
router.use(trackingRoutes);
router.use(notificationRoutes);
router.use(mapsRoutes);
router.use(bookingRoutes);
router.use('/bookings', bookingRoutes);
router.use(bookingsRoutes);

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

router.post('/bookings/:bookingId/assign-driver/preparation', (req, res, next) => {
  try {
    const assignmentPreparation = realtimeOrchestratorService.prepareDriverAssignment({
      bookingId: req.params.bookingId,
      pickupLocation: req.body.pickupLocation,
    });
    res.json({ assignmentPreparation });
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


router.get('/incidents', (_req, res) => {
  res.json({ incidents: incidentManagementService.listIncidents(), unresolved: incidentManagementService.listUnresolved(), timeoutRisks: incidentManagementService.detectTimeoutRisks() });
});

router.post('/incidents', (req, res, next) => {
  try {
    const incident = incidentManagementService.openIncident(req.body);
    res.status(201).json({ incident });
  } catch (error) {
    next(error);
  }
});

router.post('/incidents/:incidentId/acknowledge', (req, res, next) => {
  try {
    const incident = incidentManagementService.acknowledgeIncident(req.params.incidentId, req.body.actor, req.body.note);
    res.json({ incident });
  } catch (error) {
    next(error);
  }
});

router.post('/incidents/:incidentId/escalate', (req, res, next) => {
  try {
    const incident = incidentManagementService.escalateIncident(req.params.incidentId, req.body.actor, req.body.target, req.body.note);
    res.json({ incident });
  } catch (error) {
    next(error);
  }
});

router.post('/incidents/:incidentId/recovery-action', (req, res, next) => {
  try {
    const incident = incidentManagementService.logRecoveryAction(req.params.incidentId, req.body.actor, req.body.action, req.body.note, req.body.metadata);
    res.json({ incident });
  } catch (error) {
    next(error);
  }
});

router.post('/incidents/:incidentId/manual-override', (req, res, next) => {
  try {
    const incident = incidentManagementService.applyManualOverride(req.params.incidentId, req.body.actor, req.body.authorityRole, req.body.note);
    res.json({ incident });
  } catch (error) {
    next(error);
  }
});

router.post('/incidents/:incidentId/resolve', (req, res, next) => {
  try {
    const incident = incidentManagementService.resolveIncident(req.params.incidentId, req.body.actor, req.body.outcome, req.body.note);
    res.json({ incident });
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

router.post('/drivers/:driverId/telemetry', (req, res, next) => {
  try {
    const telemetry = realtimeOrchestratorService.updateDriverTelemetry({ driverId: req.params.driverId, ...req.body });
    res.json({ telemetry });
  } catch (error) {
    next(error);
  }
});

router.post('/drivers/:driverId/location', (req, res, next) => {
  try {
    const result = realtimeOrchestratorService.shareDriverLocation({
      driverId: req.params.driverId,
      bookingId: req.body.bookingId,
      source: req.body.source,
      location: {
        lat: Number(req.body.lat),
        lng: Number(req.body.lng),
        heading: typeof req.body.heading === 'number' ? req.body.heading : undefined,
        accuracyMeters: typeof req.body.accuracyMeters === 'number' ? req.body.accuracyMeters : undefined,
      },
    });
    if (!result.accepted) return res.status(409).json(result);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/drivers/:driverId/telemetry/restore', (req, res, next) => {
  try {
    const telemetry = realtimeOrchestratorService.restoreDriverTelemetry({ driverId: req.params.driverId, ...req.body });
    res.json({ telemetry });
  } catch (error) {
    next(error);
  }
});

router.get('/operations/telemetry/diagnostics', (_req, res) => {
  res.json({ telemetry: realtimeOrchestratorService.getTelemetryDiagnostics() });
});

export default router;

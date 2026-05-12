import { Router } from 'express';
import { bookingNotificationFlowService } from '../../bookings/booking-notification-flow.service.js';
import { notificationService } from '../../notifications/notification.service.js';

const notificationRoutes = Router();

const demoContext = (bookingId: string) => ({
  bookingId,
  customerId: 'customer-demo',
  customerEmail: 'customer@demo.local',
  adminId: 'admin-demo',
  status: 'confirmed' as const,
});

notificationRoutes.post('/bookings/:bookingId/confirm', (req, res) => {
  return res.json(bookingNotificationFlowService.onBookingConfirmed(demoContext(req.params.bookingId)));
});

notificationRoutes.post('/bookings/:bookingId/status/:status', (req, res) => {
  const context = { ...demoContext(req.params.bookingId), status: req.params.status as never };
  return res.json(bookingNotificationFlowService.onBookingStatusUpdated(context));
});

notificationRoutes.post('/bookings/:bookingId/assign/:driverId', (req, res) => {
  const context = { ...demoContext(req.params.bookingId), status: 'driver_assigned' as const, driverId: req.params.driverId };
  return res.json(bookingNotificationFlowService.onDriverAssigned(context));
});

notificationRoutes.post('/bookings/:bookingId/admin-warning', (req, res) => {
  return res.json(bookingNotificationFlowService.onAdminNewBookingAlert(demoContext(req.params.bookingId)));
});

notificationRoutes.post('/bookings/:bookingId/complete', (req, res) => {
  return res.json(bookingNotificationFlowService.onRideCompleted({ ...demoContext(req.params.bookingId), status: 'completed' }));
});

notificationRoutes.get('/notifications/logs', (_req, res) => res.json(notificationService.getDeliveryLogs()));
notificationRoutes.get('/notifications/active', (req, res) => res.json(notificationService.getOperationalQueue()));
notificationRoutes.get('/notifications/stale', (_req, res) => res.json(notificationService.getDiagnostics()));
notificationRoutes.get('/notifications/restore/:recipientId', (req, res) => {
  return res.json(notificationService.restoreActiveNotifications(req.params.recipientId));
});

export default notificationRoutes;

import { Router } from 'express';
import { bookingNotificationFlowService } from '../../bookings/booking-notification-flow.service.js';
import { notificationService } from '../../notifications/notification.service.js';

const notificationRoutes = Router();

notificationRoutes.post('/bookings/:bookingId/confirm', (req, res) => {
  const bookingId = req.params.bookingId;
  const context = { bookingId, customerId: 'customer-demo', customerEmail: 'customer@demo.local', adminId: 'admin-demo', status: 'confirmed' as const };
  return res.json(bookingNotificationFlowService.onBookingConfirmed(context));
});

notificationRoutes.get('/notifications/logs', (_req, res) => res.json(notificationService.getLogs()));

export default notificationRoutes;

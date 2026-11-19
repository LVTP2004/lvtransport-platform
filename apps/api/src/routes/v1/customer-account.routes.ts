import { createHash } from 'node:crypto';
import { Router } from 'express';
import { createAuthenticationMiddleware, type IdentityVerifier } from '../../auth/middleware/authenticate.js';
import type { RequestAuthContext } from '../../auth/models/request-auth-context.js';
import { bookingFlowService } from '../../modules/bookings/service.js';
import { validateCreateBookingPayload } from '../../modules/bookings/validation.js';
import { BookingOperationError, createBookingOperations } from '../../modules/bookings/operations.js';

export function createCustomerAccountRoutes(verify: IdentityVerifier, service: typeof bookingFlowService = bookingFlowService,
  operations = createBookingOperations()) {
  const router = Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.use(createAuthenticationMiddleware(verify));
  router.get('/bookings', async (req, res) => {
    const identity = (req as RequestAuthContext).auth!;
    try {
      const bookings = operations.listCustomerBookings({ userId: identity.userId, role: identity.role, status: 'active' });
      res.json({ success: true, bookings });
    } catch { res.status(503).json({ success: false, code: 'BOOKINGS_UNAVAILABLE' }); }
  });
  router.post('/bookings', async (req, res) => {
    const uid = (req as RequestAuthContext).auth!.userId;
    let payload;
    const key = req.header('Idempotency-Key');
    try {
      if (!key || !/^[A-Za-z0-9_.:-]{8,120}$/.test(key)) throw new Error('Idempotency key is required.');
      payload = validateCreateBookingPayload(req.body);
    } catch { res.status(400).json({ success: false, code: 'INVALID_BOOKING_REQUEST' }); return; }
    try {
      const storedKey = createHash('sha256').update(JSON.stringify(['customer', uid, key])).digest('hex');
      const booking = await service.createBooking({ ...payload, customerId: uid, customerIdentityVerified: true }, storedKey);
      if (booking.customerIdentityVerified !== true || booking.customerId !== uid) throw new Error('Ownership conflict');
      res.status(201).json({ success: true, booking: { referenceCode: booking.referenceCode, status: booking.status } });
    } catch { res.status(503).json({ success: false, code: 'BOOKING_NOT_CONFIRMED' }); }
  });
  router.post('/bookings/:id/cancel', (req, res) => {
    const identity = (req as RequestAuthContext).auth!;
    try {
      const result = operations.cancelOwn({ userId: identity.userId, role: identity.role, status: 'active' },
        req.params.id, req.body, req.header('Idempotency-Key'));
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(error instanceof BookingOperationError ? error.status : 503).json({ success: false,
        code: error instanceof BookingOperationError ? error.code : 'CANCELLATION_UNAVAILABLE' });
    }
  });
  return router;
}

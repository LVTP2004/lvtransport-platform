import { Router, type Request, type Response, type NextFunction } from 'express';
import { createAuthenticationMiddleware, type IdentityVerifier, type VerifiedIdentity } from '../../auth/middleware/authenticate.js';
import type { RequestAuthContext } from '../../auth/models/request-auth-context.js';
import { createBookingOperations, BookingOperationError } from '../../modules/bookings/operations.js';

/** Registered only by trusted server bootstrap. No client-provided roles/verifiers. */
export function createBookingOperationsRoutes(verify: IdentityVerifier, operations: ReturnType<typeof createBookingOperations>, passengerAbsenceEnabled = false) {
  const router = Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.use(createAuthenticationMiddleware(verify));
  const actor = (req: Request): VerifiedIdentity => {
    const identity = (req as RequestAuthContext).auth;
    if (!identity || identity.status !== 'active') throw new BookingOperationError(401, 'AUTHENTICATION_REQUIRED');
    return { userId: identity.userId, role: identity.role, status: 'active' };
  };
  const handle = (work: (req: Request) => unknown) => async (req: Request, res: Response, _next: NextFunction) => {
    try { res.json({ success: true, ...(await work(req) as Record<string, unknown>) }); }
    catch (error) {
      const known = error instanceof BookingOperationError;
      res.status(known ? error.status : 503).json({ success: false,
        code: known ? error.code : 'OPERATIONS_UNAVAILABLE' });
    }
  };
  router.get('/bookings', handle(req => ({ bookings: operations.listBookings(actor(req)) })));
  router.get('/vehicles', handle(req => ({ vehicles: operations.listVehicles(actor(req)) })));
  router.post('/vehicles', handle(req => ({ vehicle: operations.createVehicle(actor(req), req.body) })));
  router.get('/drivers', handle(req => ({ drivers: operations.listDrivers(actor(req)) })));
  router.get('/drivers/me', handle(req => ({ driver: operations.ownDriver(actor(req)) })));
  router.post('/drivers/me/presence', handle(async req => ({ driver: await operations.presence(actor(req), req.body) })));
  router.post('/drivers/me/heartbeat', handle(async req => ({ driver: await operations.heartbeat(actor(req), req.body) })));
  router.post('/bookings/:id/assignment', handle(req => operations.assign(actor(req), req.params.id, req.body, req.header('Idempotency-Key'))));
  router.post('/bookings/:id/status', handle(req => operations.transition(actor(req), req.params.id, req.body, req.header('Idempotency-Key'))));
  router.post('/bookings/:id/location', handle(req => operations.setLocation(actor(req), req.params.id, req.body)));
  if (passengerAbsenceEnabled) {
    router.post('/bookings/:id/passenger-absence', handle(req =>
      operations.reportPassengerAbsence(actor(req), req.params.id, req.body, req.header('Idempotency-Key'))));
    router.post('/bookings/:id/passenger-absence/review', handle(req =>
      operations.resolvePassengerAbsence(actor(req), req.params.id, req.body, req.header('Idempotency-Key'))));
  }
  return router;
}

import { Router } from 'express';
import healthRoutes from './health.routes.js';
import customerBookingRoutes from './customer-booking.routes.js';
import { createAuthSessionRoutes } from './auth-session.routes.js';
import { createConfiguredFirebaseVerifier, createConfiguredCustomerVerifier, resolveConfiguredDriver } from '../../auth/services/firebase-admin-bootstrap.js';
import { createBookingOperations } from '../../modules/bookings/operations.js';
import { createBookingOperationsRoutes } from './booking-operations.routes.js';
import { createCustomerAccountRoutes } from './customer-account.routes.js';

const router = Router();
const bookingOperations = createBookingOperations(undefined, resolveConfiguredDriver);

router.use('/health', healthRoutes);
// Lazy trusted bootstrap: never accept a project or verifier from an HTTP caller.
router.use('/auth', createAuthSessionRoutes(token => createConfiguredFirebaseVerifier('lv-tranport')(token),
  token => createConfiguredCustomerVerifier()(token)));
router.use('/customer', createCustomerAccountRoutes(token => createConfiguredCustomerVerifier()(token), undefined, bookingOperations));
router.use('/operations', createBookingOperationsRoutes(
  token => createConfiguredFirebaseVerifier('lv-tranport')(token),
  bookingOperations,
));
router.use(customerBookingRoutes);

export default router;

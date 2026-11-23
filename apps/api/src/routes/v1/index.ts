import { Router } from 'express';
import { respondToMoniRide } from './moni-ride.routes.js';
import healthRoutes from './health.routes.js';
import customerBookingRoutes from './customer-booking.routes.js';
import { createAuthSessionRoutes } from './auth-session.routes.js';
import { assertStagingFirebaseCredentials, createConfiguredFirebaseVerifier, createConfiguredCustomerVerifier, resolveConfiguredDriver, resolveFirebaseProject } from '../../auth/services/firebase-admin-bootstrap.js';
import { createBookingOperations } from '../../modules/bookings/operations.js';
import { createBookingOperationsRoutes } from './booking-operations.routes.js';
import { createCustomerAccountRoutes } from './customer-account.routes.js';

const router = Router();
const firebaseProject = resolveFirebaseProject();
if (process.env.LVTP_FIREBASE_MODE === 'staging') {
  assertStagingFirebaseCredentials(firebaseProject, process.env.GOOGLE_APPLICATION_CREDENTIALS);
}
const bookingOperations = createBookingOperations(undefined, userId => resolveConfiguredDriver(userId, firebaseProject));

router.post('/moni/ride/chat', respondToMoniRide);
router.use('/health', healthRoutes);
// Lazy trusted bootstrap: never accept a project or verifier from an HTTP caller.
router.use('/auth', createAuthSessionRoutes(token => createConfiguredFirebaseVerifier(firebaseProject)(token),
  token => createConfiguredCustomerVerifier(firebaseProject)(token)));
router.use('/customer', createCustomerAccountRoutes(token => createConfiguredCustomerVerifier(firebaseProject)(token), undefined, bookingOperations));
router.use('/operations', createBookingOperationsRoutes(
  token => createConfiguredFirebaseVerifier(firebaseProject)(token),
  bookingOperations,
));
router.use(customerBookingRoutes);

export default router;

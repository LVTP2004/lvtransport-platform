import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { logger } from '../../utils/logger.js';
import { parseApiJson } from './parse-api-json.js';
import { publicRateLimit } from './public-rate-limit.js';
import { respondToMoniRide } from './moni-ride.routes.js';
import healthRoutes from './health.routes.js';
import customerBookingRoutes from './customer-booking.routes.js';
import { createAuthSessionRoutes } from './auth-session.routes.js';
import { assertStagingFirebaseCredentials, createConfiguredFirebaseVerifier, createConfiguredCustomerVerifier, createConfiguredEmailCodeService, resolveConfiguredDriver, resolveFirebaseProject } from '../../auth/services/firebase-admin-bootstrap.js';
import { configuredEmailCodeSender } from '../../notifications/email-code-smtp.js';
import { createBookingOperations } from '../../modules/bookings/operations.js';
import { createBookingOperationsRoutes } from './booking-operations.routes.js';
import { createCustomerAccountRoutes } from './customer-account.routes.js';

const router = Router();
const firebaseProject = resolveFirebaseProject();
if (process.env.LVTP_FIREBASE_MODE === 'staging') {
  assertStagingFirebaseCredentials(firebaseProject, process.env.GOOGLE_APPLICATION_CREDENTIALS);
}
const bookingOperations = createBookingOperations(undefined, userId => resolveConfiguredDriver(userId, firebaseProject));

router.post('/moni/ride/chat', publicRateLimit(8, 30), parseApiJson, respondToMoniRide);
router.use('/health', healthRoutes);
// Lazy trusted bootstrap: never accept a project or verifier from an HTTP caller.
router.use(customerBookingRoutes);
let emailCodes: ReturnType<typeof createConfiguredEmailCodeService> | undefined;
try {
  const codeSender = configuredEmailCodeSender();
  if (codeSender) emailCodes = createConfiguredEmailCodeService(firebaseProject, { signingKey: randomBytes(32), send: codeSender });
} catch {
  logger.warn('auth.email_code.configuration_invalid');
}
router.use('/auth', createAuthSessionRoutes(token => createConfiguredFirebaseVerifier(firebaseProject)(token),
  token => createConfiguredCustomerVerifier(firebaseProject)(token), emailCodes));
const verifyApplicant = (token: string) => createConfiguredCustomerVerifier(firebaseProject, true)(token);
router.use('/customer', parseApiJson, createCustomerAccountRoutes(
  token => createConfiguredCustomerVerifier(firebaseProject)(token), undefined, bookingOperations, verifyApplicant,
));
router.use('/operations', parseApiJson, createBookingOperationsRoutes(
  token => createConfiguredFirebaseVerifier(firebaseProject)(token),
  bookingOperations,
  false,
  true,
));

export default router;

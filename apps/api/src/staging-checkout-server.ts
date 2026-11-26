import express from 'express';
import cors from 'cors';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createFirebaseIdentityVerifier } from './auth/services/firebase-identity-verifier.js';
import { FileBookingRepository } from './modules/bookings/repository.js';
import { createBookingFlowService } from './modules/bookings/service.js';
import { createBookingOperations } from './modules/bookings/operations.js';
import { createStagingCheckout } from './modules/payments/staging-checkout.js';
import { createStagingCheckoutWebhooks } from './modules/payments/staging-checkout-webhooks.js';
import { createAuthSessionRoutes } from './routes/v1/auth-session.routes.js';
import { createBookingOperationsRoutes } from './routes/v1/booking-operations.routes.js';
import { createCustomerAccountRoutes } from './routes/v1/customer-account.routes.js';
import { createCustomerBookingRoutes } from './routes/v1/customer-booking.routes.js';

const { LVTP_FIREBASE_MODE, LVTP_STAGING_FIREBASE_PROJECT_ID: projectId, GOOGLE_APPLICATION_CREDENTIALS: credentials,
  STRIPE_TEST_SECRET_KEY: key, STRIPE_STAGING_CHECKOUT_ORIGIN: origin, PORT } = process.env;
const port = Number(PORT);
if (LVTP_FIREBASE_MODE !== 'staging' || !projectId || projectId === 'lv-tranport' || !credentials || !key || !origin
  || !Number.isInteger(port) || port < 1024 || port > 65535 || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error('Isolated staging project, Checkout origin, test key and port are required');
}
const account = JSON.parse(readFileSync(credentials, 'utf8'));
if (account.type !== 'service_account' || account.project_id !== projectId) throw new Error('Staging credential project mismatch');
const dataRoot = resolve(process.cwd());
if (!dataRoot.startsWith('/tmp/lvtp-checkout-')) throw new Error('A dedicated temporary Checkout store is required');

const auth = getAuth(initializeApp({ projectId, credential: applicationDefault() }));
const verify = createFirebaseIdentityVerifier(auth, projectId);
const customer = createFirebaseIdentityVerifier(auth, projectId, Date.now, { allowUnassignedCustomer: true });
const repository = new FileBookingRepository(resolve(dataRoot, 'bookings.json'));
const flow = createBookingFlowService(repository);
const operations = createBookingOperations(repository, async id => {
  const driver = await auth.getUser(id);
  if (driver.disabled || driver.customClaims?.role !== 'driver' || driver.customClaims?.status !== 'active') throw Error('Driver unavailable');
  return { id, name: driver.displayName || 'Staging driver' };
});
const server = express();
server.use(cors({ origin }));
const signingSecretFile = resolve(dataRoot, 'stripe-webhook-secret');
const webhooks = existsSync(signingSecretFile)
  ? createStagingCheckoutWebhooks(resolve(dataRoot, 'checkout-webhooks'), readFileSync(signingSecretFile, 'utf8').trim())
  : undefined;
if (webhooks) server.use('/api/v1', webhooks.router);
const approversFile = resolve(dataRoot, 'refund-approver-uids');
const refundApprovers = new Set(existsSync(approversFile)
  ? readFileSync(approversFile, 'utf8').split(/\r?\n/).map(uid => uid.trim()).filter(Boolean)
  : []);
server.use(express.json({ limit: '32kb', inflate: false }));
server.use('/api/v1', createStagingCheckout(repository, resolve(dataRoot, 'checkout'), key, origin, verify, customer, fetch, webhooks, refundApprovers));
server.use('/api/v1', createCustomerBookingRoutes(flow));
server.use('/api/v1/auth', createAuthSessionRoutes(verify, customer));
server.use('/api/v1/customer', createCustomerAccountRoutes(customer, flow, operations));
server.use('/api/v1/operations', createBookingOperationsRoutes(verify, operations));
server.get('/health', (_req, res) => res.json({ staging: true, payments: 'stripe-test' }));
server.listen(port, '127.0.0.1', () => console.log('Stripe Checkout staging is listening on loopback'));

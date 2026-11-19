import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createFirebaseIdentityVerifier } from './firebase-identity-verifier.js';

/** Only trusted server bootstrap may call this; no HTTP-configurable project. */
function configuredAuth(projectId: string) {
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) {
    throw new Error('Firebase project configuration is required');
  }
  // Admin SDK emulator mode bypasses signature checks. Keep it out of this factory.
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Emulator mode is not allowed here');
  const name = 'lvtp-verified-auth';
  const existing = getApps().find(app => app.name === name);
  if (existing && existing.options.projectId !== projectId) throw new Error('Firebase project mismatch');
  const app = existing ?? initializeApp({ projectId, credential: applicationDefault() }, name);
  return getAuth(app);
}

export function createConfiguredFirebaseVerifier(projectId: string) {
  return createFirebaseIdentityVerifier(configuredAuth(projectId), projectId);
}

export function createConfiguredCustomerVerifier() {
  return createFirebaseIdentityVerifier(configuredAuth('lv-tranport'), 'lv-tranport', Date.now,
    { allowUnassignedCustomer: true });
}

/** Resolve only an already authorized driver; never grants roles or creates users. */
export async function resolveConfiguredDriver(userId: string) {
  const user = await configuredAuth('lv-tranport').getUser(userId);
  if (user.disabled || user.customClaims?.status !== 'active' || user.customClaims?.role !== 'driver') {
    throw new Error('Authorized driver unavailable');
  }
  return { id: user.uid, name: user.displayName || user.email || user.uid };
}

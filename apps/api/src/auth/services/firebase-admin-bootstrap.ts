import { readFileSync } from 'node:fs';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createFirebaseEmailCodeService } from './email-code.service.js';
import { createFirebaseIdentityVerifier } from './firebase-identity-verifier.js';

const productionProject = 'lv-tranport';

export function resolveFirebaseProject(env: NodeJS.ProcessEnv = process.env): string {
  const mode = env.LVTP_FIREBASE_MODE;
  const project = env.LVTP_STAGING_FIREBASE_PROJECT_ID;
  if (env.NODE_ENV !== 'staging' && (mode === undefined || mode === 'production') && project === undefined) return productionProject;
  if (mode !== 'staging' || !project || project === productionProject
      || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project)
      || env.FIREBASE_AUTH_EMULATOR_HOST
      || [env.GCLOUD_PROJECT, env.GOOGLE_CLOUD_PROJECT].some(value => value && value !== project)) {
    throw new Error('Invalid isolated Firebase staging configuration');
  }
  return project;
}

/** Only trusted server bootstrap may call this; no HTTP-configurable project. */
export function assertStagingFirebaseCredentials(projectId: string, file: string | undefined): void {
  let credentials;
  try {
    if (!file) throw new Error('Missing credential path');
    credentials = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    throw new Error('Staging Firebase service account configuration is required');
  }
  if (credentials?.type !== 'service_account' || credentials.project_id !== projectId
      || projectId === productionProject) {
    throw new Error('Staging Firebase service account project mismatch');
  }
}

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

export function createConfiguredEmailCodeService(projectId: string,
  options: Parameters<typeof createFirebaseEmailCodeService>[1]) {
  return createFirebaseEmailCodeService(configuredAuth(projectId), options);
}

export function createConfiguredFirebaseVerifier(projectId: string) {
  return createFirebaseIdentityVerifier(configuredAuth(projectId), projectId);
}

export function createConfiguredCustomerVerifier(projectId = productionProject, requireVerifiedEmail = false) {
  return createFirebaseIdentityVerifier(configuredAuth(projectId), projectId, Date.now,
    { allowUnassignedCustomer: true, requireVerifiedEmail });
}

/** Resolve only an already authorized driver; never grants roles or creates users. */
export async function resolveConfiguredDriver(userId: string, projectId = productionProject) {
  const user = await configuredAuth(projectId).getUser(userId);
  if (user.disabled || user.customClaims?.status !== 'active' || user.customClaims?.role !== 'driver') {
    throw new Error('Authorized driver unavailable');
  }
  return { id: user.uid, name: user.displayName || user.email || user.uid };
}

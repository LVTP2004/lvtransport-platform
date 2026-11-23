import type { FirebaseOptions } from 'firebase/app';
import { createFirebaseBrowserProvider } from '../providers/firebase-browser.adapter.js';

// Public web configuration supplied by the project owner. Not an Admin credential.
// Only Authentication fields are included; no Analytics/DB/Storage initialization.
export const LVTP_FIREBASE_PROJECT_ID = 'lv-tranport';
// Publish Microsoft buttons only after enabling the provider in this Firebase project.
export const LVTP_MICROSOFT_SIGN_IN_ENABLED = false;
export const LVTP_FIREBASE_WEB_OPTIONS: Readonly<FirebaseOptions> = Object.freeze({
  apiKey: 'AIzaSyCAGFSLoEsR7cVJrxzKBY0N8YNUFiW8Rr0',
  authDomain: 'lv-tranport.firebaseapp.com',
  projectId: LVTP_FIREBASE_PROJECT_ID,
  appId: '1:393610391278:web:d56b1d17ae54a9df3ccdff',
});

export function resolveFirebaseWebOptions(env: Record<string, string | undefined>): Readonly<FirebaseOptions> {
  const projectId = env.VITE_LVTP_STAGING_FIREBASE_PROJECT_ID;
  const apiKey = env.VITE_LVTP_STAGING_FIREBASE_API_KEY;
  const appId = env.VITE_LVTP_STAGING_FIREBASE_APP_ID;
  if (env.MODE !== 'staging') {
    if ([projectId, apiKey, appId].some(value => value !== undefined)) {
      throw new Error('Staging Firebase options require Vite staging mode');
    }
    return LVTP_FIREBASE_WEB_OPTIONS;
  }
  const api = env.VITE_API_BASE_URL;
  if (!projectId || projectId === LVTP_FIREBASE_PROJECT_ID
      || !/^[a-z][a-z0-9-]{4,28}$/.test(projectId) || projectId.endsWith('-')
      || !apiKey?.trim() || apiKey === LVTP_FIREBASE_WEB_OPTIONS.apiKey
      || !appId?.trim() || appId === LVTP_FIREBASE_WEB_OPTIONS.appId
      || !api || !/^http:\/\/(?:localhost|127\.0\.0\.1):[0-9]+\/api\/v1\/?$/.test(api)) {
    throw new Error('Invalid isolated Firebase staging configuration');
  }
  return Object.freeze({ projectId, apiKey, appId, authDomain: `${projectId}.firebaseapp.com` });
}

const firebaseEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const firebaseWebOptions = resolveFirebaseWebOptions(firebaseEnv);

/** Explicit, lazy bootstrap. Importing this module never signs a user in. */
export function createLVTransportFirebaseProvider(portal: 'admin' | 'driver' | 'customer' | 'founder') {
  if (!['admin', 'driver', 'customer', 'founder'].includes(portal)) throw new Error('Unknown portal');
  return createFirebaseBrowserProvider(firebaseWebOptions,
    firebaseEnv.MODE === 'staging' ? `lvtransport-staging-${firebaseWebOptions.projectId}-${portal}-auth` : `lvtransport-${portal}-auth`);
}

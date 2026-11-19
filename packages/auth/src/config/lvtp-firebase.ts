import type { FirebaseOptions } from 'firebase/app';
import { createFirebaseBrowserProvider } from '../providers/firebase-browser.adapter.js';

// Public web configuration supplied by the project owner. Not an Admin credential.
// Only Authentication fields are included; no Analytics/DB/Storage initialization.
export const LVTP_FIREBASE_PROJECT_ID = 'lv-tranport';
export const LVTP_FIREBASE_WEB_OPTIONS: Readonly<FirebaseOptions> = Object.freeze({
  apiKey: 'AIzaSyCAGFSLoEsR7cVJrxzKBY0N8YNUFiW8Rr0',
  authDomain: 'lv-tranport.firebaseapp.com',
  projectId: LVTP_FIREBASE_PROJECT_ID,
  appId: '1:393610391278:web:d56b1d17ae54a9df3ccdff',
});

/** Explicit, lazy bootstrap. Importing this module never signs a user in. */
export function createLVTransportFirebaseProvider(portal: 'admin' | 'driver' | 'customer') {
  if (!['admin', 'driver', 'customer'].includes(portal)) throw new Error('Unknown portal');
  return createFirebaseBrowserProvider(LVTP_FIREBASE_WEB_OPTIONS, `lvtransport-${portal}-auth`);
}

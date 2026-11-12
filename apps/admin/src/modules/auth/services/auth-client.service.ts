import { AuthService, type AuthProviderAdapter } from '@lvtransport/auth';

// The repository's FirebaseAuthProvider returns fixed runtime tokens and a
// synthetic session/profile. Do not authorize this cockpit with that placeholder.
// A real SDK/server-verified provider and authoritative roles must be wired and
// reviewed separately. Setting a UI flag alone must never enable access.
export const adminAuthenticationConfigured = false;
// Concrete blocker: prepareAuth() in @lvtransport/realtime is mode=placeholder;
// initializeFirebaseApp() only returns metadata. Neither creates Firebase Auth.
// No real SDK/auth initialization is installed in the reviewed head. Public
// Firebase config alone cannot turn that placeholder into verified identity.
export const adminAuthenticationBlocker = 'VERIFIED_FIREBASE_PROVIDER_NOT_IMPLEMENTED';
const unavailable = async (): Promise<never> => {
  throw new Error('Admin authentication is not configured. Access is disabled.');
};
export const adminAuthProvider: AuthProviderAdapter = {
  signIn: unavailable,
  signOut: async () => undefined,
  refresh: unavailable,
  getSession: async () => ({ authenticated: false }),
  getInitialState: async () => ({ isAuthenticated: false, isLoading: false, user: null, tokens: null }),
  getUserProfile: async () => null,
  sendPasswordReset: unavailable,
  sendVerification: unavailable,
};
export const adminAuthService = new AuthService(adminAuthProvider);

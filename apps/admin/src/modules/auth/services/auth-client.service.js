import { AuthService, FirebaseAuthProvider } from '@lvtransport/auth';
export const adminAuthProvider = new FirebaseAuthProvider();
export const adminAuthService = new AuthService(adminAuthProvider);

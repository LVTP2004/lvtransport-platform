import { AuthService, FirebaseAuthProvider } from '@lvtransport/auth';
export const driverAuthProvider = new FirebaseAuthProvider();
export const driverAuthService = new AuthService(driverAuthProvider);

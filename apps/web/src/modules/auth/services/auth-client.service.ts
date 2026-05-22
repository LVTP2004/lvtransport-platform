import { AuthService, FirebaseAuthProvider } from '@lvtransport/auth';

export const webAuthProvider = new FirebaseAuthProvider();
export const webAuthService = new AuthService(webAuthProvider);

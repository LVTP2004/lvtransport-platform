import { AuthService, FirebaseAuthProvider } from '@lvtransport/auth';
export const webAuthService = new AuthService(new FirebaseAuthProvider());

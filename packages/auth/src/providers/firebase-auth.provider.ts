import { AuthProvider } from '../enums/auth.enums';
import type { AuthProviderAdapter, LoginInput } from '../interfaces/auth-provider.interface';

export class FirebaseAuthProvider implements AuthProviderAdapter {
  async signIn(_: LoginInput) { throw new Error('Firebase sign-in not implemented. Architecture only.'); }
  async signOut(_: string) {}
  async refresh(_: string) { throw new Error('Firebase refresh not implemented.'); }
  async sendPasswordReset(_: string) {}
  async sendVerification(_: string) {}
  async getSession(_: string) { return { sessionId: 'placeholder', userId: 'placeholder', provider: AuthProvider.FIREBASE, createdAt: Date.now(), lastSeenAt: Date.now(), mfaVerified: false, trustedDevice: false }; }
  async getInitialState() { return { isAuthenticated: false, isLoading: false }; }
}

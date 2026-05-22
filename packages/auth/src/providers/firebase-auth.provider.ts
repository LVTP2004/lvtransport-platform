import { AuthProvider } from '../enums/auth.enums.js';
import type { AuthProviderAdapter, LoginInput } from '../interfaces/auth-provider.interface.js';
import type { AuthTokens } from '../models/session.models.js';

export class FirebaseAuthProvider implements AuthProviderAdapter {
  async signIn(_: LoginInput): Promise<AuthTokens> {
    throw new Error('Firebase sign-in not implemented. Architecture only.');
  }

  async signOut(_: string): Promise<void> {}

  async refresh(_: string): Promise<AuthTokens> {
    throw new Error('Firebase refresh not implemented.');
  }

  async sendPasswordReset(_: string): Promise<void> {}

  async sendVerification(_: string): Promise<void> {}

  async getSession(_: string) {
    return {
      sessionId: 'placeholder',
      userId: 'placeholder',
      provider: AuthProvider.FIREBASE,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      mfaVerified: false,
      trustedDevice: false,
    };
  }

  async getInitialState() {
    return { isAuthenticated: false, isLoading: false };
  }
}

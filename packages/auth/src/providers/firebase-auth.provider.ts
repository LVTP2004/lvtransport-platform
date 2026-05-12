// @ts-nocheck
import { AuthProvider } from '../enums/auth.enums.js';
import type { AuthProviderAdapter, LoginInput } from '../interfaces/auth-provider.interface.js';

export class FirebaseAuthProvider implements AuthProviderAdapter {
  async signIn(_: LoginInput) {
    return { accessToken: 'placeholder-access-token', refreshToken: 'placeholder-refresh-token', expiresAt: Date.now() + 3_600_000 };
  }
  async signOut(_: string) {}
  async refresh(_: string) {
    return { accessToken: 'placeholder-access-token', refreshToken: 'placeholder-refresh-token', expiresAt: Date.now() + 3_600_000 };
  }
  async sendPasswordReset(_: string) {}
  async sendVerification(_: string) {}
  async getSession(_: string) { return { sessionId: 'placeholder', userId: 'placeholder', provider: AuthProvider.FIREBASE, createdAt: Date.now(), lastSeenAt: Date.now(), mfaVerified: false, trustedDevice: false }; }
  async getInitialState() { return { isAuthenticated: false, isLoading: false }; }
}

// @ts-nocheck
import { AuthProvider } from '../enums/auth.enums';
import type { AuthProviderAdapter, LoginInput } from '../interfaces/auth-provider.interface';
import type { AuthTokens, AuthState, SessionContext } from '../models/session.models';

export class FirebaseAuthProvider implements AuthProviderAdapter {
  async signIn(_: LoginInput): Promise<AuthTokens> { throw new Error('Firebase sign-in not implemented. Architecture only.'); }
  async signOut(_: string): Promise<void> {}
  async refresh(_: string): Promise<AuthTokens> { throw new Error('Firebase refresh not implemented.'); }
  async sendPasswordReset(_: string): Promise<void> {}
  async sendVerification(_: string): Promise<void> {}
  async getSession(_: string): Promise<SessionContext> { return { sessionId: 'placeholder', userId: 'placeholder', provider: AuthProvider.FIREBASE, createdAt: Date.now(), lastSeenAt: Date.now(), mfaVerified: false, trustedDevice: false }; }
  async getInitialState(): Promise<AuthState> { return { isAuthenticated: false, isLoading: false }; }
}

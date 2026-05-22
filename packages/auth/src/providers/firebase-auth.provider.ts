import { AccountStatus, AccountType, AuthProvider, OnboardingStep, Permission, UserRole, type UserAccount } from '../index';
import type { AuthProviderAdapter, LoginInput } from '../interfaces/auth-provider.interface';
import { AuthProvider } from '../enums/auth.enums.js';
import type { AuthProviderAdapter, LoginInput } from '../interfaces/auth-provider.interface.js';
import type { AuthTokens } from '../models/session.models.js';

const KEY = 'lvtransport.auth.session';

const env = { apiKey: 'FIREBASE_API_KEY_PLACEHOLDER', authDomain: 'FIREBASE_AUTH_DOMAIN_PLACEHOLDER' };

const mockUserFromEmail = (email = ''): UserAccount => {
  const isAdmin = email.includes('admin');
  const isDriver = email.includes('driver');
  const role = isAdmin ? UserRole.ADMIN : isDriver ? UserRole.DRIVER : UserRole.CUSTOMER;
  const accountType = isAdmin ? AccountType.ADMIN : isDriver ? AccountType.DRIVER : AccountType.CUSTOMER;
  return { id: email, email, accountType, roles: [role], permissions: role === UserRole.ADMIN ? [Permission.ADMIN_READ, Permission.ADMIN_WRITE] : role === UserRole.DRIVER ? [Permission.DRIVER_UPDATE_STATUS] : [Permission.BOOK_RIDE], status: AccountStatus.ACTIVE, onboardingStep: OnboardingStep.PROFILE, profile: { firstName: role, lastName: 'User' } };
};

export class FirebaseAuthProvider implements AuthProviderAdapter {
  async signIn(input: LoginInput) {
    const accessToken = btoa(JSON.stringify({ sub: input.email, role: mockUserFromEmail(input.email).roles[0], status: 'active' }));
    const tokens = { accessToken, refreshToken: `${accessToken}.refresh`, idToken: 'firebase-id-token-placeholder', expiresAt: Date.now() + 3600_000 };
    localStorage.setItem(KEY, JSON.stringify({ tokens, env }));
    return tokens;
  }
  async signOut(_: string) { localStorage.removeItem(KEY); }
  async refresh(refreshToken: string) { return { accessToken: refreshToken.replace('.refresh', ''), refreshToken, expiresAt: Date.now() + 3600_000 }; }
  async sendPasswordReset(_: string) {}
  async sendVerification(_: string) {}
  async getSession(accessToken: string) { return { sessionId: `session-${accessToken.slice(0, 12)}`, userId: 'placeholder', provider: AuthProvider.FIREBASE, createdAt: Date.now(), lastSeenAt: Date.now(), mfaVerified: false, trustedDevice: false }; }
  async getUserProfile(accessToken: string) { try { const payload = JSON.parse(atob(accessToken)); return mockUserFromEmail(payload.sub); } catch { return undefined; } }
  async getInitialState() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { isAuthenticated: false, isLoading: false };
    const parsed = JSON.parse(raw);
    return { isAuthenticated: true, isLoading: false, tokens: parsed.tokens };
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

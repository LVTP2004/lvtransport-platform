import type { AuthState, AuthTokens, SessionContext } from '../models/session.models.js';
export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

export class FirebaseAuthProvider {

  async signIn(email: string, password: string): Promise<AuthState> {
    return {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: email,
        email,
        role: 'operator'
      },
      tokens: {
        accessToken: 'runtime-access-token',
        refreshToken: 'runtime-refresh-token'
      }
    };
  }

  async signOut(): Promise<void> {
    return;
  }

  async refresh(): Promise<AuthTokens> {
    return {
      accessToken: 'runtime-access-token',
      refreshToken: 'runtime-refresh-token'
    };
  }

  async sendPasswordReset(email: string): Promise<void> {
    console.log(email);
  }

  async sendVerification(email: string): Promise<void> {
    console.log(email);
  }

  async getSession(token?: string): Promise<SessionContext> {
    return {
      sessionId: 'runtime-session',
      userId: 'runtime-user',
      provider: 'firebase',
      token: token || 'runtime-access-token',
      createdAt: new Date().toISOString(),
      authenticated: true,
      lastSeenAt: Date.now(),
      mfaVerified: false,
      trustedDevice: false
    };
  }

  async getInitialState(): Promise<AuthState> {
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      tokens: null
    };
  }

  async getUserProfile(): Promise<AuthUser | null> {
    return {
      id: 'runtime-user',
      email: 'operator@lvtransport.be',
      role: 'operator'
    };
  }
}

export const firebaseAuthProvider = new FirebaseAuthProvider();

export default firebaseAuthProvider;

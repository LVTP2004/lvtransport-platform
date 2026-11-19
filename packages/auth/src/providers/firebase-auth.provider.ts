import type { AuthState, AuthTokens, SessionContext } from '../models/session.models.js';
import type { AuthProviderAdapter } from '../interfaces/auth-provider.interface.js';

export interface AuthUser { id: string; email: string; role?: string }

/** Real SDK-backed adapter is required. No fixed tokens or synthetic sessions. */
export class FirebaseAuthProvider implements AuthProviderAdapter {
  constructor(private readonly adapter?: AuthProviderAdapter) {}
  private configured(): AuthProviderAdapter {
    if (!this.adapter) throw new Error('Firebase authentication is not configured');
    return this.adapter;
  }
  async signIn(email: string, password: string): Promise<AuthState> {
    return this.configured().signIn(email, password);
  }
  async signInWithGoogle(): Promise<AuthState> {
    const adapter = this.configured();
    if (!adapter.signInWithGoogle) throw new Error('Google authentication is not configured');
    return adapter.signInWithGoogle();
  }
  async signOut(sessionId?: string): Promise<void> {
    if (this.adapter) await this.adapter.signOut(sessionId);
  }
  async refresh(token?: string): Promise<AuthTokens | undefined> {
    return this.configured().refresh(token);
  }
  async sendPasswordReset(email: string): Promise<void> {
    return this.configured().sendPasswordReset(email);
  }
  async sendVerification(email: string): Promise<void> {
    return this.configured().sendVerification(email);
  }
  async getSession(token?: string): Promise<SessionContext> {
    return this.configured().getSession(token);
  }
  async getInitialState(): Promise<AuthState> {
    if (!this.adapter) return { isAuthenticated: false, isLoading: false, user: null, tokens: null };
    return this.adapter.getInitialState();
  }
  async getUserProfile(): Promise<unknown> {
    return this.configured().getUserProfile();
  }
}
export const firebaseAuthProvider = new FirebaseAuthProvider();
export default firebaseAuthProvider;

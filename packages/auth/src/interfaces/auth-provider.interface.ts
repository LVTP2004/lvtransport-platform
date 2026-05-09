import type { AuthState, AuthTokens, SessionContext } from '../models/session.models';
export interface LoginInput { email?: string; password?: string; oauthToken?: string; }
export interface AuthProviderAdapter {
  signIn(input: LoginInput): Promise<AuthTokens>;
  signOut(sessionId: string): Promise<void>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  sendPasswordReset(email: string): Promise<void>;
  sendVerification(email: string): Promise<void>;
  getSession(accessToken: string): Promise<SessionContext>;
  getInitialState(): Promise<AuthState>;
}

import type { AuthState, AuthTokens, SessionContext } from '../models/session.models';
import type { UserAccount } from '../models/user.models';
import type { AuthState, AuthTokens, SessionContext } from '../models/session.models.js';
export interface LoginInput { email?: string; password?: string; oauthToken?: string; }
export interface AuthProviderAdapter {
  signIn(input: LoginInput): Promise<AuthTokens>;
  signOut(sessionId: string): Promise<void>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  sendPasswordReset(email: string): Promise<void>;
  sendVerification(email: string): Promise<void>;
  getSession(accessToken: string): Promise<SessionContext>;
  getUserProfile(accessToken: string): Promise<UserAccount | undefined>;
  getInitialState(): Promise<AuthState>;
}

import type { AuthState, AuthTokens, SessionContext } from '../models/session.models.js';

export interface LoginInput {
  email: string;
  password: string;
}

export type Permission = string;

export interface UserAccount {
  id: string;
  email: string;
  role?: string;
  permissions?: Permission[];
}

export interface AuthProviderAdapter {
  signIn(email: string, password: string): Promise<AuthState>;
  rememberSession?(remember: boolean): Promise<void>;
  sendEmailLink?(email: string, returnUrl: string): Promise<void>;
  signInWithCustomToken?(token: string): Promise<AuthState>;
  signInWithEmailLink?(email: string, link: string): Promise<AuthState>;
  signInWithGoogle?(): Promise<AuthState>;
  signInWithMicrosoft?(): Promise<AuthState>;
  linkMicrosoftAccount?(userId: string): Promise<void>;
  signOut(sessionId?: string): Promise<void>;
  refresh(token?: string): Promise<AuthTokens | undefined>;
  getUserProfile(): Promise<unknown>;
  sendPasswordReset(email: string): Promise<void>;
  sendVerification(email: string): Promise<void>;
  getSession(token?: string): Promise<SessionContext>;
  getInitialState(): Promise<AuthState>;
}

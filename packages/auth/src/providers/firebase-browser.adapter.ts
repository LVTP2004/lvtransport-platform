import { initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  initializeAuth, inMemoryPersistence, signInWithEmailAndPassword, signOut,
  sendPasswordResetEmail, sendEmailVerification, getIdTokenResult, type Auth, type User,
  GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver,
} from 'firebase/auth';
import type { AuthProviderAdapter } from '../interfaces/auth-provider.interface.js';
import type { AuthState, AuthTokens, SessionContext } from '../models/session.models.js';
import { FirebaseAuthProvider } from './firebase-auth.provider.js';

/** Roles here are presentation hints. Only the API grants resource access. */
export class FirebaseBrowserAdapter implements AuthProviderAdapter {
  constructor(private readonly auth: Auth) {}

  private async user(): Promise<User> {
    await this.auth.authStateReady();
    const user = this.auth.currentUser;
    if (!user) throw new Error('Authentication required');
    return user;
  }

  private async tokens(user: User, forceRefresh = false): Promise<AuthTokens> {
    const result = await getIdTokenResult(user, forceRefresh);
    return { accessToken: result.token, idToken: result.token,
      expiresAt: Date.parse(result.expirationTime) };
  }

  async signIn(email: string, password: string): Promise<AuthState> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    return { isAuthenticated: true, isLoading: false,
      user: { id: credential.user.uid, email: credential.user.email },
      tokens: await this.tokens(credential.user) };
  }

  async signInWithGoogle(): Promise<AuthState> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(this.auth, provider, browserPopupRedirectResolver);
    return { isAuthenticated: true, isLoading: false,
      user: { id: credential.user.uid, email: credential.user.email },
      tokens: await this.tokens(credential.user) };
  }

  async signOut(): Promise<void> { await signOut(this.auth); }
  async refresh(): Promise<AuthTokens> { return this.tokens(await this.user(), true); }
  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }
  async sendVerification(): Promise<void> { await sendEmailVerification(await this.user()); }
  async getUserProfile() {
    const user = await this.user();
    const result = await getIdTokenResult(user);
    return { id: user.uid, email: user.email ?? '',
      role: typeof result.claims.role === 'string' ? result.claims.role : undefined };
  }
  async getSession(): Promise<SessionContext> {
    const user = await this.user();
    return { userId: user.uid, provider: 'firebase', authenticated: true,
      token: (await this.tokens(user)).accessToken };
  }
  async getInitialState(): Promise<AuthState> {
    await this.auth.authStateReady();
    const user = this.auth.currentUser;
    if (!user) return { isAuthenticated: false, isLoading: false, user: null, tokens: null };
    return { isAuthenticated: true, isLoading: false,
      user: { id: user.uid, email: user.email }, tokens: await this.tokens(user) };
  }
}

/** Explicit config only. No credentials/default project and no persistent storage. */
export function createFirebaseBrowserProvider(options: FirebaseOptions, appName: string): FirebaseAuthProvider {
  if (!options.projectId || !options.apiKey || !options.appId || !appName.trim()) {
    throw new Error('Firebase project configuration is required');
  }
  const app = initializeApp(options, appName);
  const auth = initializeAuth(app, { persistence: inMemoryPersistence });
  return new FirebaseAuthProvider(new FirebaseBrowserAdapter(auth));
}

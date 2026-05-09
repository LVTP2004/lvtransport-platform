import type { AuthProviderAdapter, LoginInput } from '../interfaces/auth-provider.interface';
import type { AuthState } from '../models/session.models';

export class AuthService {
  constructor(private readonly provider: AuthProviderAdapter) {}
  signIn(input: LoginInput) { return this.provider.signIn(input); }
  signOut(sessionId: string) { return this.provider.signOut(sessionId); }
  refresh(token: string) { return this.provider.refresh(token); }
  sendPasswordReset(email: string) { return this.provider.sendPasswordReset(email); }
  sendVerification(email: string) { return this.provider.sendVerification(email); }
  getInitialState(): Promise<AuthState> { return this.provider.getInitialState(); }
}

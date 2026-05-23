import type { AuthProviderAdapter, LoginInput } from '../interfaces/auth-provider.interface.js';

export class AuthService {
  constructor(private readonly provider: AuthProviderAdapter) {}

  signIn(input: LoginInput) {
    return this.provider.signIn(input.email, input.password);
  }

  signOut(sessionId?: string) {
    return this.provider.signOut(sessionId);
  }

  refresh(token?: string) {
    return this.provider.refresh(token);
  }

  getUserProfile() {
    return this.provider.getUserProfile();
  }

  sendPasswordReset(email: string) {
    return this.provider.sendPasswordReset(email);
  }

  sendVerification(email: string) {
    return this.provider.sendVerification(email);
  }

  getSession(token?: string) {
    return this.provider.getSession(token);
  }

  getInitialState() {
    return this.provider.getInitialState();
  }
}

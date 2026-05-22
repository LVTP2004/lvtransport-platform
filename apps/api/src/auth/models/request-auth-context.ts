import type { JwtClaims, SessionContext, UserAccount } from '@lvtransport/auth';

export interface RequestAuthContext {
  session?: SessionContext;
  user?: UserAccount;
  claims?: JwtClaims;
  authToken?: string;
}

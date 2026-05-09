import type { SessionContext, UserAccount } from '@lvtransport/auth';
export interface RequestAuthContext { session?: SessionContext; user?: UserAccount; }

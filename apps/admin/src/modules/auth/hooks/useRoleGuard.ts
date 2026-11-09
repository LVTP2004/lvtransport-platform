import type { UserAccount, UserRole } from '@lvtransport/auth';
export const hasRole = (user: UserAccount | undefined, role: UserRole) => user?.role === role;

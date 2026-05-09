import type { UserAccount, UserRole } from '@lvtransport/auth';
export const hasRole = (user: UserAccount | undefined, role: UserRole) => Boolean(user?.roles.includes(role));

import type { UserAccount, UserRole } from '@lvtransport/auth';

// Role comparison only; callers still require verified session authority.
export const hasRole = (user: UserAccount | undefined, role: UserRole) => user?.role === role;

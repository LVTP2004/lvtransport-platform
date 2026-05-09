import type { Permission, UserAccount } from '@lvtransport/auth';
export const hasPermissions = (user: UserAccount | undefined, permissions: Permission[]) => Boolean(user && permissions.every((p) => user.permissions.includes(p)));

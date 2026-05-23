import type { Permission, UserAccount } from '@lvtransport/auth';
export function canAccess(user: UserAccount | undefined, permissions: Permission[] = []) {
  if (!user) return false;
  return permissions.every((p) => (user.permissions ?? []).includes(p));
}

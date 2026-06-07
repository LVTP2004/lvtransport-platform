import type { AuthRole } from '../models/request-auth-context.js';

const rolePermissions: Record<AuthRole, string[]> = {
  customer: ['book:ride', 'manage:profile'],
  driver: ['driver:update_status'],
  admin: ['admin:read', 'admin:write'],
  super_admin: ['admin:read', 'admin:write', 'admin:secure_action', 'audit:read']
};

export const accessControlService = {
  permissionsForRole(role: AuthRole) {
    return rolePermissions[role] ?? [];
  },

  hasPermissions(role: AuthRole, permissions: string[]) {
    const granted = rolePermissions[role] ?? [];
    return permissions.every((permission) => granted.includes(permission));
  }
};

import type { NextFunction, Request, Response } from 'express';
import type { Permission } from '@lvtransport/auth';
import { AccountStatus, UserRole } from '@lvtransport/auth';

const rolePermissionMap: Record<UserRole, Permission[]> = {
  customer: ['book:ride', 'manage:profile'],
  business_customer: ['book:ride', 'manage:profile'],
  vip_customer: ['book:ride', 'manage:profile'],
  driver: ['driver:update_status', 'driver:upload_documents'],
  fleet_driver: ['driver:update_status', 'driver:upload_documents'],
  admin: ['admin:read', 'admin:write', 'audit:read'],
  ops_admin: ['admin:read', 'admin:write', 'audit:read'],
  super_admin: ['admin:read', 'admin:write', 'admin:secure_action', 'audit:read']
};

export const authorize = (permissions: Permission[]) => (req: Request, res: Response, next: NextFunction) => {
  const auth = (req as Request & { auth?: { role: UserRole; status: AccountStatus } }).auth;
  if (!auth || auth.status !== AccountStatus.ACTIVE) return res.status(401).json({ message: 'Unauthorized or inactive account' });
  const granted = rolePermissionMap[auth.role] ?? [];
  if (!permissions.every((p) => granted.includes(p))) return res.status(403).json({ message: 'Insufficient role permissions' });
  next();
};
import type { Permission, UserRole } from '@lvtransport/auth';
import type { RequestAuthContext } from '../models/request-auth-context.js';

export const authorize = (permissions: Permission[], roles: UserRole[] = []) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as Request & RequestAuthContext;
    if (!user) {
      res.status(401).json({ message: 'Unauthenticated request' });
      return;
    }

    if (roles.length > 0 && !roles.some((role) => user.roles.includes(role))) {
      res.status(403).json({ message: 'Insufficient role access' });
      return;
    }

    if (!permissions.every((permission) => user.permissions.includes(permission))) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };

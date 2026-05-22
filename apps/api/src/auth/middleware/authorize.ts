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

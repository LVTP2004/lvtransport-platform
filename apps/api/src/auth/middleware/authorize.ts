import type { NextFunction, Request, Response } from 'express';
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

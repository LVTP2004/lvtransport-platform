import type { RequestAuthContext, AuthRole } from '../models/request-auth-context.js';
import { accessControlService } from '../services/access-control.service.js';
import type { RequestHandler } from 'express';

export function authorize(
  permissions: string[],
  roles: AuthRole[] = []
) {
  return (req: RequestAuthContext) => {
    const auth = req.auth;

    if (!auth || auth.status !== 'active') {
      return { ok: false, statusCode: 401, message: 'Unauthorized or inactive account' };
    }

    if (roles.length > 0 && !roles.includes(auth.role)) {
      return { ok: false, statusCode: 403, message: 'Insufficient role access' };
    }

    if (!accessControlService.hasPermissions(auth.role, permissions)) {
      return { ok: false, statusCode: 403, message: 'Insufficient permissions' };
    }

    return { ok: true, statusCode: 200, message: 'Authorized' };
  };
}

export function requirePermissions(permissions: string[], roles: AuthRole[] = []): RequestHandler {
  return (req, res, next) => {
    const decision = authorize(permissions, roles)(req as RequestAuthContext);
    if (!decision.ok) {
      res.status(decision.statusCode).json({ success: false, message: decision.message });
      return;
    }
    next();
  };
}

/** Owner ID must be loaded from the stored resource, never req.body or query. */
export function ownsResource(req: RequestAuthContext, storedOwnerId: string | undefined): boolean {
  return Boolean(req.auth?.status === 'active' && storedOwnerId && req.auth.userId === storedOwnerId);
}

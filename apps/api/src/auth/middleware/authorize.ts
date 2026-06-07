import type { RequestAuthContext, AuthRole } from '../models/request-auth-context.js';
import { accessControlService } from '../services/access-control.service.js';

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

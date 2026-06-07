import type { RequestAuthContext, AuthRole, AuthStatus } from '../models/request-auth-context.js';
import { AUTH_HEADER, BEARER_PREFIX } from '../constants/auth.constants.js';
import { accessControlService } from '../services/access-control.service.js';

type HeaderLikeRequest = {
  headers?: Record<string, string | string[] | undefined>;
} & RequestAuthContext;

const parseRole = (value: unknown): AuthRole => {
  if (value === 'driver' || value === 'admin' || value === 'super_admin') return value;
  return 'customer';
};

const parseStatus = (value: unknown): AuthStatus => {
  if (value === 'inactive' || value === 'pending') return value;
  return 'active';
};

export function authenticate<T extends HeaderLikeRequest>(req: T): T {
  const raw = req.headers?.[AUTH_HEADER];
  const header = Array.isArray(raw) ? raw[0] : raw;

  if (!header?.startsWith(BEARER_PREFIX)) return req;

  const token = header.slice(BEARER_PREFIX.length).trim();

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8')) as {
      sub?: string;
      role?: string;
      status?: string;
    };

    const role = parseRole(decoded.role);
    const status = parseStatus(decoded.status);

    req.auth = {
      userId: decoded.sub ?? 'unknown',
      role,
      status,
      token,
      permissions: accessControlService.permissionsForRole(role)
    };
  } catch {
    req.auth = undefined;
  }

  return req;
}

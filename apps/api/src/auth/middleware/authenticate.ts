import { verifyJwt } from '@lvtransport/auth';
import type { RequestAuthContext, AuthRole } from '../models/request-auth-context.js';
import { AUTH_HEADER, BEARER_PREFIX } from '../constants/auth.constants.js';
import { accessControlService } from '../services/access-control.service.js';

type HeaderLikeRequest = {
  headers?: Record<string, string | string[] | undefined>;
} & RequestAuthContext;

const roleFromClaims = (roles: string[]): AuthRole | undefined => {
  if (roles.includes('super_admin')) return 'super_admin';
  if (roles.includes('admin') || roles.includes('ops_admin')) return 'admin';
  if (roles.includes('driver') || roles.includes('fleet_driver')) return 'driver';
  if (
    roles.includes('customer') ||
    roles.includes('business_customer') ||
    roles.includes('vip_customer')
  ) {
    return 'customer';
  }
  return undefined;
};

export function authenticate<T extends HeaderLikeRequest>(req: T): T {
  req.auth = undefined;

  const raw = req.headers?.[AUTH_HEADER];
  const header = Array.isArray(raw) ? (raw.length === 1 ? raw[0] : undefined) : raw;
  if (typeof header !== 'string') return req;

  const match = new RegExp('^' + BEARER_PREFIX.trim() + '\\s+(\\S+)$', 'i').exec(header.trim());
  if (!match) return req;

  const token = match[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) return req;

  try {
    const claims = verifyJwt(token, secret);
    if (claims.status !== 'active') return req;

    const role = roleFromClaims(claims.roles);
    if (!role) return req;

    req.auth = {
      userId: claims.sub,
      role,
      status: 'active',
      token,
      permissions: accessControlService.permissionsForRole(role)
    };
  } catch {
    req.auth = undefined;
  }

  return req;
}

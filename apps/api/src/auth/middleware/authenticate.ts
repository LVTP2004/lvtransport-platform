import type { RequestHandler } from 'express';
import type { RequestAuthContext, AuthRole } from '../models/request-auth-context.js';
import { accessControlService } from '../services/access-control.service.js';

export type VerifiedIdentity = { userId: string; role: AuthRole; status: 'active' };
export type IdentityVerifier = (token: string) => Promise<VerifiedIdentity>;
type HeaderLikeRequest = { headers?: Record<string, string | string[] | undefined> } & RequestAuthContext;

/** Verifier supplied only by trusted server bootstrap; no Base64 fallback. */
export async function authenticate<T extends HeaderLikeRequest>(req: T, verify?: IdentityVerifier): Promise<T> {
  req.auth = undefined;
  const header = req.headers?.authorization;
  if (!verify || typeof header !== 'string' || header.length > 16384) return req;
  const match = /^Bearer ([^\s]+)$/.exec(header);
  if (!match) return req;
  try {
    const identity = await verify(match[1]);
    if (!identity.userId || identity.status !== 'active'
        || !['customer', 'driver', 'admin', 'super_admin'].includes(identity.role)) return req;
    req.auth = { ...identity, token: match[1],
      permissions: accessControlService.permissionsForRole(identity.role) };
  } catch {
    req.auth = undefined;
  }
  return req;
}

export function createAuthenticationMiddleware(verify?: IdentityVerifier): RequestHandler {
  return async (req, res, next) => {
    await authenticate(req, verify);
    if (!(req as HeaderLikeRequest).auth) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    next();
  };
}

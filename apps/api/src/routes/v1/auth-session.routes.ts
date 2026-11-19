import { Router } from 'express';
import { createAuthenticationMiddleware, type IdentityVerifier } from '../../auth/middleware/authenticate.js';
import type { RequestAuthContext } from '../../auth/models/request-auth-context.js';

/** Inspection of the verified caller only; no role or account mutations. */
export function createAuthSessionRoutes(verify: IdentityVerifier, customerVerify?: IdentityVerifier) {
  const router = Router();
  router.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  router.get('/session', createAuthenticationMiddleware(verify), (req, res) => {
    const auth = (req as RequestAuthContext).auth;
    if (!auth) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    res.json({ success: true, identity: {
      userId: auth.userId, role: auth.role, status: auth.status,
      permissions: [...auth.permissions],
    } });
  });
  if (customerVerify) router.get('/customer-session', createAuthenticationMiddleware(customerVerify), (req, res) => {
    const auth = (req as RequestAuthContext).auth;
    if (!auth) { res.status(401).json({ success: false }); return; }
    res.json({ success: true, identity: { userId: auth.userId, role: auth.role, status: 'active', scope: 'customer',
      permissions: ['book:ride', 'manage:profile'] } });
  });
  return router;
}

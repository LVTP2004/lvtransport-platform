import { Router } from 'express';
import { createAuthenticationMiddleware, type IdentityVerifier } from '../../auth/middleware/authenticate.js';
import { requirePermissions } from '../../auth/middleware/authorize.js';
import { isEmailCodePortal, type createEmailCodeService } from '../../auth/services/email-code.service.js';
import { parseApiJson } from './parse-api-json.js';
import type { RequestAuthContext } from '../../auth/models/request-auth-context.js';

/** Inspection of the verified caller only; no role or account mutations. */
export function createAuthSessionRoutes(verify: IdentityVerifier, customerVerify?: IdentityVerifier, emailCodes?: ReturnType<typeof createEmailCodeService>) {
  const router = Router();
  router.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  router.get('/sign-in-methods', (_req, res) => res.json({ emailCode: Boolean(emailCodes) }));
  if (emailCodes) {
    const requests = new Map<string, { until: number; count: number }>();
    router.use('/email-code', (req, res, next) => {
      const now = Date.now();
      for (const [key, rate] of requests) if (rate.until <= now) requests.delete(key);
      const key = req.ip ?? 'unknown';
      const rate = requests.get(key) ?? { until: now + 60_000, count: 0 };
      if (rate.count >= 20 || (!requests.has(key) && requests.size >= 5_000)) {
        res.status(429).json({ success: false, code: 'TRY_LATER' });
        return;
      }
      rate.count++;
      requests.set(key, rate);
      next();
    });
    router.post('/email-code/request', parseApiJson, (req, res) => {
      const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      const portal = req.body?.portal;
      if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !isEmailCodePortal(portal)) {
        res.status(400).json({ success: false, code: 'INVALID_EMAIL_CODE_REQUEST' });
        return;
      }
      res.status(202).json({ success: true, challengeId: emailCodes.issue(email, portal) });
    });
    router.post('/email-code/redeem', parseApiJson, async (req, res) => {
      const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      const { portal, challengeId, code } = req.body ?? {};
      if (email.length > 254 || !isEmailCodePortal(portal) || typeof challengeId !== 'string'
        || !/^[a-f0-9-]{36}$/.test(challengeId) || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
        res.status(400).json({ success: false, code: 'INVALID_EMAIL_CODE_REQUEST' });
        return;
      }
      try {
        const token = await emailCodes.redeem(email, portal, challengeId, code);
        if (token) {
          res.json({ success: true, token });
          return;
        }
      } catch {
        // Preserve the same response for an invalid challenge and a session that cannot be minted.
      }
      res.status(401).json({ success: false, code: 'EMAIL_CODE_NOT_ACCEPTED' });
    });
  }
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
  if (customerVerify) router.get('/customer-session', createAuthenticationMiddleware(customerVerify), requirePermissions([], ['customer']), (req, res) => {
    const auth = (req as RequestAuthContext).auth;
    if (!auth) { res.status(401).json({ success: false }); return; }
    res.json({ success: true, identity: { userId: auth.userId, role: auth.role, status: 'active', scope: 'customer',
      permissions: ['book:ride', 'manage:profile'] } });
  });
  return router;
}

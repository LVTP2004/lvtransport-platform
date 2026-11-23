import { Router } from 'express';
import { createAuthenticationMiddleware, type IdentityVerifier } from '../../auth/middleware/authenticate.js';
import type { RequestAuthContext } from '../../auth/models/request-auth-context.js';
import type { StagingPaymentService } from '../../modules/payments/staging-payments.js';

export function createStagingPaymentsRouter(service: StagingPaymentService, verifyIdentity: IdentityVerifier) {
  const router = Router();

  router.get('/:bookingId', createAuthenticationMiddleware(verifyIdentity), async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const auth = (req as RequestAuthContext).auth;
    if (!auth || auth.status !== 'active') {
      res.status(401).json({ success: false });
      return;
    }
    if (auth.role !== 'customer') {
      res.status(403).json({ success: false });
      return;
    }
    try {
      const payment = await service.readOwn({ userId: auth.userId, role: auth.role, status: auth.status }, req.params.bookingId);
      if (payment === undefined) {
        res.status(404).json({ success: false });
        return;
      }
      res.json({ success: true, payment });
    } catch {
      res.status(500).json({ success: false });
    }
  });

  return router;
}

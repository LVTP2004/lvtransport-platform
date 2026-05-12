import { Router } from 'express';
import { paymentArchitectureService } from './services/payment-architecture.service.js';

const router = Router();

router.post('/checkout/prepare', (req, res) => {
  const session = paymentArchitectureService.createCheckoutSession(req.body);
  res.status(201).json({ session, bookingPayment: paymentArchitectureService.getBookingPaymentState(req.body.bookingId) });
});

router.post('/checkout/:sessionId/confirm', (req, res) => {
  const session = paymentArchitectureService.confirmSession(req.params.sessionId);
  if (!session) return res.status(404).json({ message: 'session_not_found' });
  return res.json({ session, bookingPayment: paymentArchitectureService.getBookingPaymentState(session.bookingId) });
});

router.post('/retry', (req, res) => res.json(paymentArchitectureService.scheduleRetry(req.body)));
router.post('/refund/prepare', (req, res) => res.status(201).json(paymentArchitectureService.prepareRefund(req.body)));
router.post('/webhooks/:provider', (req, res) => res.json(paymentArchitectureService.handleWebhookEvent(req.body.eventType, req.body.sessionId)));
router.get('/bookings/:bookingId/status', (req, res) => res.json(paymentArchitectureService.getBookingPaymentState(req.params.bookingId)));
router.get('/transactions', (req, res) => res.json(paymentArchitectureService.getTransactionHistory(req.query.bookingId as string | undefined)));
router.get('/diagnostics', (req, res) => res.json(paymentArchitectureService.getPaymentDiagnostics(req.query.bookingId as string | undefined)));
router.post('/reconnect/restore', (req, res) => res.json(paymentArchitectureService.restoreAfterReconnect(req.body)));
router.get('/reconnect/snapshot', (_req, res) => res.json(paymentArchitectureService.snapshotForReconnect()));
router.get('/invoice/prepare/:bookingId/:customerId', (req, res) => res.json(paymentArchitectureService.prepareInvoice(req.params.bookingId, req.params.customerId)));

export default router;

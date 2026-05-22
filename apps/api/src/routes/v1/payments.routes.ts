import { Router } from 'express';
import { paymentArchitectureService } from '../../modules/payments/services/payment-architecture.service.js';

const router = Router();

router.post('/checkout/prepare', (req, res) => {
  res.status(200).json(paymentArchitectureService.prepareCheckout(req.body));
});

router.post('/checkout/session', (req, res) => {
  res.status(201).json(paymentArchitectureService.createCheckoutSession(req.body));
});

router.post('/checkout/:sessionId/confirm', (req, res) => {
  res.status(200).json(paymentArchitectureService.confirmPayment(req.params.sessionId));
});

router.post('/retry', (req, res) => {
  res.status(202).json(paymentArchitectureService.scheduleRetry(req.body));
});

router.post('/refund/prepare', (req, res) => {
  res.status(202).json(paymentArchitectureService.prepareRefund(req.body));
});

router.get('/bookings/:bookingId/status', (req, res) => {
  res.status(200).json(paymentArchitectureService.getBookingPaymentStatus(req.params.bookingId));
});

router.get('/bookings/:bookingId/transactions', (req, res) => {
  res.status(200).json(paymentArchitectureService.getTransactionHistory(req.params.bookingId));
});

router.get('/bookings/:bookingId/invoice/prepare', (req, res) => {
  res.status(200).json(paymentArchitectureService.prepareInvoice(req.params.bookingId));
});

router.post('/webhooks', (req, res) => {
  res.status(202).json(paymentArchitectureService.handleWebhookEvent(req.body));
});

export default router;

import { randomUUID } from 'node:crypto';
import { CreateCheckoutSessionDto, CreateRefundRequestDto, RetryPaymentDto } from '../dto/payment.dto.js';
import { BookingPaymentState, PaymentSessionStatus } from '../enums/payment.enums.js';
import type { BookingPaymentSnapshot, PaymentSession, RefundRecord } from '../interfaces/payment.interfaces.js';
import type { TransactionHistoryEntry } from '../models/payment.models.js';
import type { PaymentWebhookEnvelope, PaymentWebhookHandlerResult } from '../webhooks/webhook.models.js';

const sessions = new Map<string, PaymentSession>();
const bookingStates = new Map<string, BookingPaymentSnapshot>();
const transactionHistory: TransactionHistoryEntry[] = [];
const refunds = new Map<string, RefundRecord>();

export class PaymentArchitectureService {
  prepareCheckout(dto: CreateCheckoutSessionDto) {
    return {
      bookingId: dto.bookingId,
      customerId: dto.customerId,
      provider: dto.provider,
      checkoutState: PaymentSessionStatus.CHECKOUT_PENDING,
      amount: { currency: 'USD', valueMinor: 12500 },
      testModeOnly: true,
      message: 'Checkout prepared using provider placeholder adapter.',
    };
  }

  createCheckoutSession(dto: CreateCheckoutSessionDto) {
    const session: PaymentSession = {
      id: `ps_${randomUUID()}`,
      bookingId: dto.bookingId,
      customerId: dto.customerId,
      provider: dto.provider,
      status: PaymentSessionStatus.CREATED,
      amount: { currency: 'USD', valueMinor: 12500 },
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      metadata: { testMode: 'true', providerFlow: 'placeholder' },
    };

    sessions.set(session.id, session);
    bookingStates.set(session.bookingId, { bookingId: session.bookingId, state: BookingPaymentState.REQUIRES_ACTION });
    transactionHistory.push({
      id: `tx_${randomUUID()}`,
      paymentSessionId: session.id,
      bookingId: session.bookingId,
      customerId: session.customerId,
      type: 'authorization',
      status: PaymentSessionStatus.CREATED,
      amount: session.amount,
      createdAt: new Date().toISOString(),
    });

    return {
      session,
      checkoutUrl: `https://test-payments.lvtransport.local/checkout/${session.id}`,
      gatewayHint: dto.provider === 'stripe' ? 'stripe_test_checkout_placeholder' : 'payconiq_test_redirect_placeholder',
    };
  }

  confirmPayment(sessionId: string) {
    const session = sessions.get(sessionId);
    if (!session) return { updated: false, reason: 'session_not_found' };

    session.status = PaymentSessionStatus.CAPTURED;
    bookingStates.set(session.bookingId, { bookingId: session.bookingId, state: BookingPaymentState.PAID, lastTransactionId: sessionId });
    transactionHistory.push({
      id: `tx_${randomUUID()}`,
      paymentSessionId: session.id,
      bookingId: session.bookingId,
      customerId: session.customerId,
      type: 'capture',
      status: PaymentSessionStatus.CAPTURED,
      amount: session.amount,
      createdAt: new Date().toISOString(),
    });

    return { updated: true, bookingId: session.bookingId, status: session.status };
  }

  scheduleRetry(dto: RetryPaymentDto) {
    return {
      implementation: 'placeholder',
      sessionId: dto.sessionId,
      previousFailureReason: dto.reason,
      nextState: BookingPaymentState.REQUIRES_ACTION,
      strategy: ['exponential_backoff', 'retry_cap', 'manual_recovery_queue'],
    };
  }

  prepareRefund(dto: CreateRefundRequestDto) {
    const record: RefundRecord = {
      id: `rf_${randomUUID()}`,
      transactionId: dto.transactionId,
      reason: dto.reasonCode,
      state: 'requested',
      amount: { currency: 'USD', valueMinor: 2500 },
    };
    refunds.set(record.id, record);
    return { record, approvalRequired: true, preparedOnly: true };
  }

  prepareInvoice(bookingId: string) {
    return {
      invoiceId: `inv_${bookingId}`,
      bookingId,
      status: 'draft_placeholder',
      generator: 'future-invoice-service',
    };
  }

  handleWebhookEvent(envelope: PaymentWebhookEnvelope): PaymentWebhookHandlerResult {
    if (!envelope.signatureValidated) {
      return { accepted: false, replayDetected: false, reason: 'invalid_signature' };
    }
    return { accepted: true, replayDetected: false };
  }

  getBookingPaymentStatus(bookingId: string) {
    return bookingStates.get(bookingId) ?? { bookingId, state: BookingPaymentState.UNPAID };
  }

  getTransactionHistory(bookingId: string) {
    return transactionHistory.filter((item) => item.bookingId === bookingId);
  }
}

export const paymentArchitectureService = new PaymentArchitectureService();

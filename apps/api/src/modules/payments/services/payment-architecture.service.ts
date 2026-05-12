import {
  BookingPaymentState,
  PaymentProvider,
  PaymentSessionStatus,
  RefundState,
} from '../enums/payment.enums';
import { CreateCheckoutSessionDto, CreateRefundRequestDto, RetryPaymentDto } from '../dto/payment.dto';
import { PaymentSession, BookingPaymentSnapshot, RefundRecord, MoneyAmount } from '../interfaces/payment.interfaces';
import { InvoiceDraft, TransactionHistoryEntry } from '../models/payment.models';

const money = (valueMinor: number): MoneyAmount => ({ currency: 'EUR', valueMinor });

export class PaymentArchitectureService {
  private sessions = new Map<string, PaymentSession>();
  private bookingStates = new Map<string, BookingPaymentSnapshot>();
  private transactions: TransactionHistoryEntry[] = [];

  createCheckoutSession(dto: CreateCheckoutSessionDto) {
    const id = `test_${dto.provider}_${Date.now()}`;
    const session: PaymentSession = {
      id,
      bookingId: dto.bookingId,
      customerId: dto.customerId,
      provider: dto.provider,
      status: PaymentSessionStatus.CHECKOUT_PENDING,
      amount: money(5500),
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      metadata: {
        mode: 'test_only',
        checkoutUrl: this.buildCheckoutUrl(dto.provider, id),
      },
    };

    this.sessions.set(id, session);
    this.bookingStates.set(dto.bookingId, { bookingId: dto.bookingId, state: BookingPaymentState.REQUIRES_ACTION, lastTransactionId: id });

    this.transactions.unshift({
      id: `txn_${id}`,
      paymentSessionId: id,
      bookingId: dto.bookingId,
      type: 'authorization',
      status: PaymentSessionStatus.CHECKOUT_PENDING,
      amount: session.amount,
      createdAt: new Date().toISOString(),
    });

    return session;
  }

  confirmSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    session.status = PaymentSessionStatus.CAPTURED;
    this.bookingStates.set(session.bookingId, { bookingId: session.bookingId, state: BookingPaymentState.PAID, lastTransactionId: sessionId });
    return session;
  }

  scheduleRetry(dto: RetryPaymentDto) {
    const session = this.sessions.get(dto.sessionId);
    if (!session) return { scheduled: false };
    session.status = PaymentSessionStatus.CHECKOUT_PENDING;
    this.bookingStates.set(session.bookingId, { bookingId: session.bookingId, state: BookingPaymentState.REQUIRES_ACTION, lastTransactionId: dto.sessionId });
    return { scheduled: true, nextRetryAt: new Date(Date.now() + 5 * 60_000).toISOString(), reason: dto.reason };
  }

  prepareRefund(dto: CreateRefundRequestDto): RefundRecord {
    return { id: `refund_${Date.now()}`, transactionId: dto.transactionId, reason: dto.reasonCode, state: RefundState.REQUESTED, amount: money(2500) };
  }

  handleWebhookEvent(eventType: string, sessionId?: string) {
    if (eventType === 'payment.succeeded' && sessionId) this.confirmSession(sessionId);
    return { accepted: true, replayDetected: false, reason: 'test-placeholder-handler' };
  }

  prepareInvoice(bookingId: string, customerId: string): InvoiceDraft {
    return { invoiceId: `draft_${bookingId}`, bookingId, customerId, subtotal: money(4500), vatAmount: money(1000), total: money(5500) };
  }

  getTransactionHistory(bookingId?: string) {
    return bookingId ? this.transactions.filter((t) => t.bookingId === bookingId) : this.transactions;
  }

  getBookingPaymentState(bookingId: string) {
    return this.bookingStates.get(bookingId) ?? { bookingId, state: BookingPaymentState.UNPAID };
  }

  private buildCheckoutUrl(provider: PaymentProvider, sessionId: string) {
    return provider === PaymentProvider.STRIPE
      ? `https://checkout.stripe.com/test/session/${sessionId}`
      : `https://payconiq.test/checkout/${sessionId}`;
  }
}

export const paymentArchitectureService = new PaymentArchitectureService();

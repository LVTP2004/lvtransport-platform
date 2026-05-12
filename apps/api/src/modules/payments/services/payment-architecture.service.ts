import { createHash, randomUUID } from 'node:crypto';
import {
  BookingPaymentState,
  PaymentProvider,
  PaymentRetryStrategy,
  PaymentSessionStatus,
  RefundState,
} from '../enums/payment.enums.js';
import { CreateCheckoutSessionDto, CreateRefundRequestDto, RetryPaymentDto } from '../dto/payment.dto.js';
import { BookingPaymentSnapshot, MoneyAmount, PaymentSession, RefundRecord } from '../interfaces/payment.interfaces.js';
import { InvoiceDraft, TransactionHistoryEntry } from '../models/payment.models.js';

interface ReconnectSnapshot {
  sessions: PaymentSession[];
  bookingStates: BookingPaymentSnapshot[];
  transactions: TransactionHistoryEntry[];
  invoices: InvoiceDraft[];
  businessAccounts: BusinessOperationalAccount[];
  recurringCustomers: RecurringCustomerProfile[];
}
interface BusinessOperationalAccount {
  accountId: string;
  legalName: string;
  tier: 'business' | 'vip';
  status: 'active' | 'suspended';
  billingEmail: string;
  invoiceTermsDays: number;
  recurringEnabled: boolean;
  createdAt: string;
}
interface RecurringCustomerProfile {
  customerId: string;
  bookingIds: string[];
  totalCompletedRides: number;
  lastRideAt?: string;
}

const money = (valueMinor: number): MoneyAmount => ({ currency: 'EUR', valueMinor });

const SESSION_TTL_MS = 15 * 60_000;
const STALE_TXN_THRESHOLD_MS = 20 * 60_000;

export class PaymentArchitectureService {
  private sessions = new Map<string, PaymentSession>();
  private bookingStates = new Map<string, BookingPaymentSnapshot>();
  private transactions: TransactionHistoryEntry[] = [];
  private invoices = new Map<string, InvoiceDraft>();
  private businessAccounts = new Map<string, BusinessOperationalAccount>();
  private recurringCustomers = new Map<string, RecurringCustomerProfile>();

  createCheckoutSession(dto: CreateCheckoutSessionDto): PaymentSession {
    const id = `pay_${dto.provider}_${Date.now()}`;
    const idempotencyKey = this.createIdempotencyKey(dto.bookingId, dto.customerId, dto.provider);

    const session: PaymentSession = {
      id,
      bookingId: dto.bookingId,
      customerId: dto.customerId,
      provider: dto.provider,
      status: PaymentSessionStatus.CHECKOUT_PENDING,
      amount: money(5500),
      retryStrategy: PaymentRetryStrategy.EXPONENTIAL_BACKOFF,
      retryCount: 0,
      maxRetryCount: 4,
      idempotencyKey,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
      metadata: {
        checkoutUrl: this.buildCheckoutUrl(dto.provider, id),
      },
    };

    this.sessions.set(id, session);
    this.syncBookingPaymentState(dto.bookingId, {
      state: BookingPaymentState.CHECKOUT_IN_PROGRESS,
      activePaymentSessionId: id,
      lastTransactionId: `txn_${id}`,
    });

    this.recordTransaction({
      paymentSessionId: id,
      bookingId: dto.bookingId,
      customerId: dto.customerId,
      type: 'authorization',
      status: session.status,
      amount: session.amount,
    });
    this.trackRecurringCustomer(dto.customerId, dto.bookingId);

    return session;
  }

  confirmSession(sessionId: string): PaymentSession | undefined {
    return this.transitionPayment(sessionId, PaymentSessionStatus.CAPTURED);
  }

  scheduleRetry(dto: RetryPaymentDto) {
    const session = this.sessions.get(dto.sessionId);
    if (!session) return { scheduled: false, reason: 'session_not_found' };

    session.retryCount += 1;
    session.status = PaymentSessionStatus.RETRY_SCHEDULED;
    this.syncBookingPaymentState(session.bookingId, {
      state: BookingPaymentState.REQUIRES_ACTION,
      activePaymentSessionId: session.id,
      lastTransactionId: `txn_retry_${session.id}_${session.retryCount}`,
    });

    this.recordTransaction({
      paymentSessionId: session.id,
      bookingId: session.bookingId,
      customerId: session.customerId,
      type: 'retry',
      status: session.status,
      amount: session.amount,
      metadata: { reason: dto.reason ?? 'not_specified' },
    });

    return {
      scheduled: session.retryCount <= session.maxRetryCount,
      nextRetryAt: new Date(Date.now() + 5 * 60_000 * session.retryCount).toISOString(),
      strategy: session.retryStrategy,
      retryCount: session.retryCount,
      reason: dto.reason,
    };
  }

  prepareRefund(dto: CreateRefundRequestDto): RefundRecord {
    return {
      id: `refund_${Date.now()}`,
      transactionId: dto.transactionId,
      reason: dto.reasonCode,
      state: RefundState.REQUESTED,
      amount: money(2500),
      requestedBy: dto.requestedBy,
    };
  }

  handleWebhookEvent(eventType: string, sessionId?: string) {
    if (!sessionId) return { accepted: false, replayDetected: false, reason: 'missing_session' };
    if (eventType === 'payment.succeeded') this.transitionPayment(sessionId, PaymentSessionStatus.CAPTURED);
    if (eventType === 'payment.failed') this.transitionPayment(sessionId, PaymentSessionStatus.FAILED);
    if (eventType === 'payment.cancelled') this.transitionPayment(sessionId, PaymentSessionStatus.CANCELLED);
    return { accepted: true, replayDetected: false };
  }

  prepareInvoice(bookingId: string, customerId: string): InvoiceDraft {
    const bookingPayment = this.getBookingPaymentState(bookingId);
    const session = bookingPayment.activePaymentSessionId
      ? this.sessions.get(bookingPayment.activePaymentSessionId)
      : undefined;
    const subtotal = session?.amount ?? money(5500);
    const vatAmount = money(Math.round(subtotal.valueMinor * 0.21));
    const invoice: InvoiceDraft = {
      invoiceId: `draft_${bookingId}`,
      bookingId,
      customerId,
      lifecycle: bookingPayment.state === BookingPaymentState.PAID ? 'paid' : 'draft',
      synchronizedAt: new Date().toISOString(),
      issuedBy: 'system',
      subtotal,
      vatAmount,
      total: money(subtotal.valueMinor + vatAmount.valueMinor),
      issuedAt: new Date().toISOString(),
    };
    this.invoices.set(invoice.invoiceId, invoice);
    this.syncBookingPaymentState(bookingId, {
      state: bookingPayment.state,
      activePaymentSessionId: bookingPayment.activePaymentSessionId,
      lastTransactionId: bookingPayment.lastTransactionId,
      invoiceLifecycleState: invoice.lifecycle,
      invoiceId: invoice.invoiceId,
      billingSynchronizedAt: invoice.synchronizedAt,
      consistencyHash: this.computeConsistencyHash(bookingId, invoice.total.valueMinor, bookingPayment.state),
    });
    return invoice;
  }

  getTransactionHistory(bookingId?: string) {
    return bookingId ? this.transactions.filter((txn) => txn.bookingId === bookingId) : this.transactions;
  }

  getBookingPaymentState(bookingId: string): BookingPaymentSnapshot {
    return this.bookingStates.get(bookingId) ?? { bookingId, state: BookingPaymentState.UNPAID };
  }

  getPaymentDiagnostics(bookingId?: string) {
    const list = this.getTransactionHistory(bookingId);
    const now = Date.now();
    const staleTransactions = list.filter((txn) => now - Date.parse(txn.createdAt) > STALE_TXN_THRESHOLD_MS);
    return {
      totalSessions: this.sessions.size,
      staleTransactionCount: staleTransactions.length,
      staleTransactions,
      orphanedBookingStates: [...this.bookingStates.values()].filter(
        (state) => state.activePaymentSessionId && !this.sessions.has(state.activePaymentSessionId),
      ),
    };
  }

  snapshotForReconnect(): ReconnectSnapshot {
    return {
      sessions: [...this.sessions.values()],
      bookingStates: [...this.bookingStates.values()],
      transactions: [...this.transactions],
      invoices: [...this.invoices.values()],
      businessAccounts: [...this.businessAccounts.values()],
      recurringCustomers: [...this.recurringCustomers.values()],
    };
  }

  restoreAfterReconnect(snapshot: ReconnectSnapshot) {
    this.sessions = new Map(snapshot.sessions.map((s) => [s.id, s]));
    this.bookingStates = new Map(snapshot.bookingStates.map((s) => [s.bookingId, s]));
    this.transactions = [...snapshot.transactions];
    this.invoices = new Map(snapshot.invoices.map((inv) => [inv.invoiceId, inv]));
    this.businessAccounts = new Map(snapshot.businessAccounts.map((acc) => [acc.accountId, acc]));
    this.recurringCustomers = new Map(snapshot.recurringCustomers.map((profile) => [profile.customerId, profile]));
    return { restored: true, sessions: this.sessions.size, bookings: this.bookingStates.size };
  }

  registerBusinessAccount(input: Omit<BusinessOperationalAccount, 'createdAt'>) {
    const record: BusinessOperationalAccount = { ...input, createdAt: new Date().toISOString() };
    this.businessAccounts.set(record.accountId, record);
    return record;
  }

  getAdminBillingLifecycle(bookingId?: string) {
    const snapshots = bookingId ? [this.getBookingPaymentState(bookingId)] : [...this.bookingStates.values()];
    return snapshots.map((snapshot) => ({
      bookingId: snapshot.bookingId,
      paymentState: snapshot.state,
      invoiceState: snapshot.invoiceLifecycleState ?? 'draft',
      invoiceId: snapshot.invoiceId ?? null,
      synchronizedAt: snapshot.billingSynchronizedAt ?? null,
      consistencyHash: snapshot.consistencyHash ?? null,
    }));
  }

  private transitionPayment(sessionId: string, status: PaymentSessionStatus): PaymentSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    session.status = status;
    this.syncBookingPaymentState(session.bookingId, {
      state: this.mapBookingState(status),
      activePaymentSessionId: session.id,
      lastTransactionId: `txn_${session.id}_${status}`,
    });

    this.recordTransaction({
      paymentSessionId: session.id,
      bookingId: session.bookingId,
      customerId: session.customerId,
      type: status === PaymentSessionStatus.CAPTURED ? 'capture' : 'authorization',
      status,
      amount: session.amount,
    });

    return session;
  }

  private mapBookingState(status: PaymentSessionStatus): BookingPaymentState {
    if (status === PaymentSessionStatus.CAPTURED) return BookingPaymentState.PAID;
    if (status === PaymentSessionStatus.FAILED) return BookingPaymentState.PAYMENT_FAILED;
    if (status === PaymentSessionStatus.CANCELLED) return BookingPaymentState.UNPAID;
    if (status === PaymentSessionStatus.RETRY_SCHEDULED) return BookingPaymentState.REQUIRES_ACTION;
    return BookingPaymentState.CHECKOUT_IN_PROGRESS;
  }

  private syncBookingPaymentState(bookingId: string, patch: Omit<BookingPaymentSnapshot, 'bookingId'>) {
    this.bookingStates.set(bookingId, { bookingId, ...patch });
  }

  private trackRecurringCustomer(customerId: string, bookingId: string) {
    const existing = this.recurringCustomers.get(customerId);
    if (!existing) {
      this.recurringCustomers.set(customerId, { customerId, bookingIds: [bookingId], totalCompletedRides: 0 });
      return;
    }
    if (!existing.bookingIds.includes(bookingId)) existing.bookingIds.push(bookingId);
    existing.lastRideAt = new Date().toISOString();
  }

  private computeConsistencyHash(bookingId: string, invoiceTotalMinor: number, paymentState: BookingPaymentState) {
    return createHash('sha256').update(`${bookingId}:${invoiceTotalMinor}:${paymentState}`).digest('hex');
  }

  private recordTransaction(input: Omit<TransactionHistoryEntry, 'id' | 'createdAt' | 'providerTransactionRef'>) {
    this.transactions.unshift({
      ...input,
      id: randomUUID(),
      providerTransactionRef: `provider_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
  }

  private createIdempotencyKey(bookingId: string, customerId: string, provider: PaymentProvider) {
    return createHash('sha256').update(`${bookingId}:${customerId}:${provider}`).digest('hex');
  }

  private buildCheckoutUrl(provider: PaymentProvider, sessionId: string) {
    return provider === PaymentProvider.STRIPE
      ? `https://checkout.stripe.com/pay/${sessionId}`
      : `https://payconiq.com/checkout/${sessionId}`;
  }
}

export const paymentArchitectureService = new PaymentArchitectureService();

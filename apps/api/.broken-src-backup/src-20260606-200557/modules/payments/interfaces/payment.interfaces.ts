import { BookingPaymentState, PaymentProvider, PaymentSessionStatus, PayoutState, RefundState } from '../enums/payment.enums.js';
import {
  BookingPaymentState,
  PaymentProvider,
  PaymentRetryStrategy,
  PaymentSessionStatus,
  PayoutState,
  RefundState,
} from '../enums/payment.enums';

export interface MoneyAmount {
  currency: string;
  valueMinor: number;
}

export interface PaymentSession {
  id: string;
  bookingId: string;
  customerId: string;
  provider: PaymentProvider;
  status: PaymentSessionStatus;
  amount: MoneyAmount;
  retryStrategy: PaymentRetryStrategy;
  retryCount: number;
  maxRetryCount: number;
  idempotencyKey: string;
  expiresAt: string;
  metadata?: Record<string, string>;
}

export interface BookingPaymentSnapshot {
  bookingId: string;
  state: BookingPaymentState;
  activePaymentSessionId?: string;
  lastTransactionId?: string;
  invoiceLifecycleState?: 'draft' | 'validated' | 'issued' | 'paid' | 'cancelled';
  invoiceId?: string;
  billingSynchronizedAt?: string;
  consistencyHash?: string;
}

export interface RefundRecord {
  id: string;
  transactionId: string;
  reason: string;
  state: RefundState;
  amount: MoneyAmount;
  requestedBy: string;
  approvedBy?: string;
}

export interface DriverPayoutRecord {
  id: string;
  driverId: string;
  periodStart: string;
  periodEnd: string;
  state: PayoutState;
  gross: MoneyAmount;
  taxWithheld?: MoneyAmount;
  fees?: MoneyAmount;
  net: MoneyAmount;
}

import { BookingPaymentState, PaymentProvider, PaymentSessionStatus, PayoutState, RefundState } from '../enums/payment.enums.js';

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
  expiresAt: string;
  metadata?: Record<string, string>;
}

export interface BookingPaymentSnapshot {
  bookingId: string;
  state: BookingPaymentState;
  lastTransactionId?: string;
}

export interface RefundRecord {
  id: string;
  transactionId: string;
  reason: string;
  state: RefundState;
  amount: MoneyAmount;
}

export interface DriverPayoutRecord {
  id: string;
  driverId: string;
  periodStart: string;
  periodEnd: string;
  state: PayoutState;
  gross: MoneyAmount;
  taxWithheld?: MoneyAmount;
  net: MoneyAmount;
}

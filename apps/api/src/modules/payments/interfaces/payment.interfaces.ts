export type MoneyAmount = {
  currency: 'USD' | 'EUR';
  valueMinor: number;
};

export type PaymentSession = {
  id: string;
  bookingId: string;
  customerId: string;
  provider: string;
  status: string;
  amount: MoneyAmount;
  expiresAt: string;
  metadata?: Record<string, string>;
};

export type BookingPaymentSnapshot = {
  bookingId: string;
  state: string;
  activePaymentSessionId?: string;
  lastTransactionId?: string;
};

export type RefundRecord = {
  id: string;
  transactionId: string;
  reason: string;
  state: string;
  amount: MoneyAmount;
};

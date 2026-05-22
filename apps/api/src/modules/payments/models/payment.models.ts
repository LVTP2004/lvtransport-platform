import { PaymentSessionStatus } from '../enums/payment.enums.js';
import { MoneyAmount } from '../interfaces/payment.interfaces.js';

export interface TransactionHistoryEntry {
  id: string;
  paymentSessionId: string;
  bookingId: string;
  type: 'authorization' | 'capture' | 'refund' | 'chargeback' | 'payout';
  status: PaymentSessionStatus;
  amount: MoneyAmount;
  createdAt: string;
}

export interface CustomerBillingProfile {
  customerId: string;
  providerCustomerRefs: Partial<Record<'stripe' | 'payconiq', string>>;
  defaultPaymentMethodRef?: string;
  billingAddressHash: string;
  taxProfile?: {
    vatNumberMasked?: string;
    vatCountryCode?: string;
    vatExempt: boolean;
  };
}

export interface InvoiceDraft {
  invoiceId: string;
  bookingId: string;
  customerId: string;
  subtotal: MoneyAmount;
  vatAmount: MoneyAmount;
  total: MoneyAmount;
  issuedAt?: string;
}

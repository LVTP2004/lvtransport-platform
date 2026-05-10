import { PaymentSessionStatus } from '../enums/payment.enums';
import { MoneyAmount } from '../interfaces/payment.interfaces';

export interface TransactionHistoryEntry {
  id: string;
  paymentSessionId: string;
  bookingId: string;
  customerId: string;
  providerTransactionRef?: string;
  type: 'authorization' | 'capture' | 'refund' | 'chargeback' | 'payout' | 'retry';
  status: PaymentSessionStatus;
  amount: MoneyAmount;
  createdAt: string;
  metadata?: Record<string, string>;
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
  security: {
    piiAccessScope: 'restricted';
    tokenizedOnly: true;
    lastUpdatedAt: string;
  };
}

export interface InvoiceDraft {
  invoiceId: string;
  bookingId: string;
  customerId: string;
  subtotal: MoneyAmount;
  vatAmount: MoneyAmount;
  discounts?: MoneyAmount;
  total: MoneyAmount;
  issuedAt?: string;
}

export interface PromoCodeApplication {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  validationState: 'pending' | 'valid' | 'invalid' | 'expired';
}

export interface BusinessPlanSubscriptionDraft {
  accountId: string;
  planCode: string;
  billingCycle: 'monthly' | 'yearly';
  trialEligible: boolean;
}

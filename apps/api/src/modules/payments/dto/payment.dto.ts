import { PaymentProvider } from '../enums/payment.enums.js';

export interface CreateCheckoutSessionDto {
  bookingId: string;
  customerId: string;
  provider: PaymentProvider;
  promoCode?: string;
  vatCountryCode?: string;
}

export interface RetryPaymentDto {
  sessionId: string;
  reason: 'authentication_timeout' | 'provider_timeout' | 'soft_decline' | 'network_error';
}

export interface CreateRefundRequestDto {
  transactionId: string;
  reasonCode: 'duplicate' | 'customer_request' | 'fraud_suspected' | 'service_issue';
  requestedBy: string;
}

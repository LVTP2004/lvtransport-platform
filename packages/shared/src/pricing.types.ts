export type CurrencyCode = 'EUR';

export type BookingPrice = {
  bookingId?: string;
  estimatedAmount?: number;
  quotedAmount?: number;
  finalAmount?: number;
  currency: CurrencyCode;
  source: 'frontend_estimate' | 'api_quote' | 'dispatch_final';
};

import { FareRuleType, PricingTier, QuoteStatus } from '../enums/fare-rule.enum';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export interface RouteEstimateInput {
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  waitTimeMin?: number;
  isAirportRoute?: boolean;
  isNight?: boolean;
  tier?: PricingTier;
}

export interface FareComponent {
  type: FareRuleType;
  label: string;
  amount: number;
  metadata?: Record<string, unknown>;
}

export interface TaxBreakdown {
  jurisdiction: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface CommissionBreakdown {
  platformCommissionAmount: number;
  driverPayoutAmount: number;
  commissionRate: number;
}

export interface TripCostBreakdown {
  currency: CurrencyCode;
  baseAmount: number;
  components: FareComponent[];
  subtotal: number;
  discountsTotal: number;
  taxes: TaxBreakdown[];
  total: number;
  commission?: CommissionBreakdown;
}

export interface BookingQuote {
  quoteId: string;
  status: QuoteStatus;
  input: RouteEstimateInput;
  breakdown: TripCostBreakdown;
  expiresAt: string;
  createdAt: string;
  pricingVersion: string;
}

export interface InvoicePreparation {
  bookingId: string;
  customerId: string;
  quoteId: string;
  tripBreakdown: TripCostBreakdown;
  vatNumber?: string;
  businessMetadata?: Record<string, string>;
}

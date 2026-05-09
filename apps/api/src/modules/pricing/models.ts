export enum FareRuleType {
  BASE_FARE = 'BASE_FARE',
  DAY_NIGHT_MULTIPLIER = 'DAY_NIGHT_MULTIPLIER',
  MINIMUM_FARE = 'MINIMUM_FARE',
  AIRPORT_SURCHARGE = 'AIRPORT_SURCHARGE',
  WAITING_TIME = 'WAITING_TIME',
  LONG_DISTANCE = 'LONG_DISTANCE',
  BUSINESS_VIP = 'BUSINESS_VIP',
  CUSTOM_ADMIN = 'CUSTOM_ADMIN',
  SURGE_PREPARATION = 'SURGE_PREPARATION',
  PROMO_CODE = 'PROMO_CODE',
  CUSTOMER_DISCOUNT = 'CUSTOMER_DISCOUNT',
  COMMISSION = 'COMMISSION',
  DRIVER_PAYOUT = 'DRIVER_PAYOUT',
  TAX_VAT = 'TAX_VAT',
}

export type ServiceTier = 'STANDARD' | 'BUSINESS' | 'VIP' | 'AIRPORT_FIXED' | 'SUBSCRIPTION_PREP';

export interface RouteEstimateInput {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  airportZone?: string;
}

export interface FareBreakdownItem {
  ruleType: FareRuleType;
  label: string;
  amount: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface FareBreakdown {
  currency: string;
  subtotal: number;
  minimumFareApplied: boolean;
  items: FareBreakdownItem[];
  taxes: TaxPreparation;
  total: number;
}

export interface TaxPreparation {
  vatRatePct?: number;
  taxJurisdiction?: string;
  taxAmount: number;
}

export interface InvoicePreparation {
  invoiceId: string;
  bookingId: string;
  customerId: string;
  lineItems: FareBreakdownItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string[];
}

export interface BookingQuoteRequest {
  bookingId: string;
  customerId: string;
  tier: ServiceTier;
  requestedAt: string;
  route: RouteEstimateInput;
  waitingTimeMin?: number;
  promoCode?: string;
  monthlyBusinessPlanId?: string;
}

export interface BookingQuote {
  quoteId: string;
  bookingId: string;
  expiresAt: string;
  assumptions: string[];
  breakdown: FareBreakdown;
  futureRealtimeAdjustmentEnabled: boolean;
}

export interface PricingEngineState {
  preparedForLiveRoutePricing: boolean;
  preparedForRealtimeDistancePricing: boolean;
  preparedForAiFareOptimization: boolean;
  preparedForSurgePricing: boolean;
  ruleVersion: string;
}

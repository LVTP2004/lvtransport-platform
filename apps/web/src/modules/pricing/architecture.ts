export interface FareBreakdownPreview {
  currency: string;
  subtotal: number;
  total: number;
  lineItems: Array<{ label: string; amount: number }>;
}

export interface BookingQuotePreview {
  quoteId: string;
  expiresAt: string;
  assumptions: string[];
  breakdown: FareBreakdownPreview;
}

export interface CustomerFarePreviewState {
  activeQuote?: BookingQuotePreview;
  routeDraftDistanceKm?: number;
  routeDraftDurationMin?: number;
  isQuoteRefreshing: boolean;
  preparedForRealtimeEtaPriceAdjustment: boolean;
}

export const webPricingArchitecture = {
  supportsCustomerFarePreview: true,
  supportsBookingQuotePolling: true,
  preparedForLiveRoutePricing: true,
  preparedForRealtimeDistancePricing: true,
  preparedForRealtimeEtaPriceAdjustment: true,
  preparedForSurgePricing: true,
  preparedForAiFareOptimization: true,
  supportsPromoAndDiscountPresentation: true,
};

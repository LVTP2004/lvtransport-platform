import type { BookingQuote, FareComponent, RouteEstimateInput } from '../../../../../api/src/pricing/models/pricing.types';

export interface CustomerFarePreviewModel {
  request: RouteEstimateInput;
  quote?: BookingQuote;
  breakdownItems: FareComponent[];
  isLoading: boolean;
  error?: string;
}

export interface RealtimePriceAdjustmentState {
  baseQuoteId?: string;
  etaAdjustmentEnabled: boolean;
  lastEtaSeconds?: number;
  pendingDeltaAmount?: number;
}

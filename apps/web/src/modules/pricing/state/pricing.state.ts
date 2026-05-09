import type { CustomerFarePreviewModel, RealtimePriceAdjustmentState } from '../models/pricing-view.models';

export interface PricingUiState {
  customerPreview: CustomerFarePreviewModel;
  realtimeAdjustment: RealtimePriceAdjustmentState;
}

export const initialPricingUiState: PricingUiState = {
  customerPreview: {
    request: { estimatedDistanceKm: 0, estimatedDurationMin: 0 },
    breakdownItems: [],
    isLoading: false
  },
  realtimeAdjustment: {
    etaAdjustmentEnabled: false
  }
};

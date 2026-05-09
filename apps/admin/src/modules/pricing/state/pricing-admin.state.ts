import type { AdminFareRuleEditorState, FareManagementDashboardModel } from '../models/admin-pricing.models';

export interface PricingAdminState {
  editor: AdminFareRuleEditorState;
  dashboard: FareManagementDashboardModel;
}

export const initialPricingAdminState: PricingAdminState = {
  editor: {
    rules: [],
    isSaving: false
  },
  dashboard: {
    activePricingVersion: 'pricing-architecture-v1',
    totalRules: 0,
    supportsAirportFixedRates: true,
    supportsSubscriptionPricing: true
  }
};

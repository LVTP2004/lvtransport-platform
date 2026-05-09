import type { AdminFareRule } from '../../../../../api/src/pricing';

export interface AdminFareRuleEditorState {
  rules: AdminFareRule[];
  selectedRuleId?: string;
  isSaving: boolean;
}

export interface FareManagementDashboardModel {
  activePricingVersion: string;
  totalRules: number;
  supportsAirportFixedRates: boolean;
  supportsSubscriptionPricing: boolean;
}

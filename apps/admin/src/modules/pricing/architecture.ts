export enum AdminFareRuleScope {
  GLOBAL = 'GLOBAL',
  CITY = 'CITY',
  AIRPORT = 'AIRPORT',
  CUSTOMER_SEGMENT = 'CUSTOMER_SEGMENT',
  SERVICE_TIER = 'SERVICE_TIER',
}

export interface AdminFareRuleDraft {
  id: string;
  name: string;
  scope: AdminFareRuleScope;
  enabled: boolean;
  priority: number;
  conditions: Record<string, string | number | boolean>;
  effects: Record<string, string | number | boolean>;
}

export interface FareManagementState {
  ruleDrafts: AdminFareRuleDraft[];
  selectedRuleId?: string;
  preparedForCommissionConfiguration: boolean;
  preparedForDriverPayoutConfiguration: boolean;
  preparedForBusinessPlanPricing: boolean;
  preparedForAirportFixedRates: boolean;
  preparedForSubscriptionPricing: boolean;
}

export const adminPricingArchitecture: FareManagementState = {
  ruleDrafts: [],
  preparedForCommissionConfiguration: true,
  preparedForDriverPayoutConfiguration: true,
  preparedForBusinessPlanPricing: true,
  preparedForAirportFixedRates: true,
  preparedForSubscriptionPricing: true,
};

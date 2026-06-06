import { AdminFareRule } from '../interfaces/admin-fare-rule.interface.js';

export interface PricingRuntimeState {
  activeVersion: string;
  cachedRules: AdminFareRule[];
  lastRuleSyncAt?: string;
  surgeEngineReady: boolean;
  aiOptimizationReady: boolean;
  liveRoutePricingReady: boolean;
}

export const initialPricingRuntimeState: PricingRuntimeState = {
  activeVersion: 'pricing-architecture-v1',
  cachedRules: [],
  surgeEngineReady: false,
  aiOptimizationReady: false,
  liveRoutePricingReady: false
};

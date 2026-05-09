import { FareRuleType, PricingTier } from '../enums/fare-rule.enum';

export interface AdminFareRule {
  id: string;
  name: string;
  type: FareRuleType;
  tierScope?: PricingTier[];
  isActive: boolean;
  priority: number;
  conditions: Record<string, unknown>;
  action: {
    mode: 'FIXED' | 'MULTIPLIER' | 'PERCENTAGE';
    value: number;
  };
  effectiveFrom: string;
  effectiveTo?: string;
}

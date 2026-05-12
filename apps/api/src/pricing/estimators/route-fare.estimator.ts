import { PRICING_CONSTANTS } from '../constants/pricing.config.js';
import { FareRuleType, PricingTier } from '../enums/fare-rule.enum.js';
import { FareComponent, RouteEstimateInput, TripCostBreakdown } from '../models/pricing.types.js';
import { RouteEstimateInput, TripCostBreakdown } from '../models/pricing.types';
import { CentralizedPricingEngineService } from '../services/centralized-pricing-engine.service';

export class RouteFareEstimator {
  constructor(private readonly pricingEngine = new CentralizedPricingEngineService()) {}

  estimate(input: RouteEstimateInput): TripCostBreakdown {
    return this.pricingEngine.calculateBreakdown(input);
  }
}

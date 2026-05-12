import { RouteEstimateInput, TripCostBreakdown } from '../models/pricing.types.js';
import { CentralizedPricingEngineService } from '../services/centralized-pricing-engine.service.js';

export class RouteFareEstimator {
  constructor(private readonly pricingEngine = new CentralizedPricingEngineService()) {}

  estimate(input: RouteEstimateInput): TripCostBreakdown {
    return this.pricingEngine.calculateBreakdown(input);
  }
}

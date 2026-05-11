import { RouteEstimateInput, TripCostBreakdown } from '../models/pricing.types';
import { CentralizedPricingEngineService } from '../services/centralized-pricing-engine.service';

export class RouteFareEstimator {
  constructor(private readonly pricingEngine = new CentralizedPricingEngineService()) {}

  estimate(input: RouteEstimateInput): TripCostBreakdown {
    return this.pricingEngine.calculateBreakdown(input);
  }
}

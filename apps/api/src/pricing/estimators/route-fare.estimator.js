import { CentralizedPricingEngineService } from '../services/centralized-pricing-engine.service.js';
export class RouteFareEstimator {
    pricingEngine;
    constructor(pricingEngine = new CentralizedPricingEngineService()) {
        this.pricingEngine = pricingEngine;
    }
    estimate(input) {
        return this.pricingEngine.calculateBreakdown(input);
    }
}

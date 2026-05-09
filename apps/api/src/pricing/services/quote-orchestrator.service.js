import { PricingEngineService } from './pricing-engine.service';
export class QuoteOrchestratorService {
    pricingEngine;
    constructor(pricingEngine = new PricingEngineService()) {
        this.pricingEngine = pricingEngine;
    }
    createCustomerFarePreview(input) {
        return this.pricingEngine.createQuote(input);
    }
    prepareRealtimeEtaAdjustment(quote) {
        return {
            ...quote,
            breakdown: {
                ...quote.breakdown,
                components: quote.breakdown.components.concat({
                    type: 'SURGE_PLACEHOLDER',
                    label: 'Realtime ETA adjustment placeholder',
                    amount: 0
                })
            }
        };
    }
}

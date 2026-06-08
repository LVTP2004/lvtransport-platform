import { PricingEngineService } from './pricing-engine.service.js';
import { BookingQuote, RouteEstimateInput } from '../models/pricing.types.js';

export class QuoteOrchestratorService {
  constructor(private readonly pricingEngine = new PricingEngineService()) {}

  createCustomerFarePreview(input: RouteEstimateInput): BookingQuote {
    return this.pricingEngine.createQuote(input);
  }

  prepareRealtimeEtaAdjustment(quote: BookingQuote): BookingQuote {
    return {
      ...quote,
      breakdown: {
        ...quote.breakdown,
        components: quote.breakdown.components.concat({
          type: 'SURGE_PLACEHOLDER' as never,
          label: 'Realtime ETA adjustment placeholder',
          amount: 0
        })
      }
    };
  }
}

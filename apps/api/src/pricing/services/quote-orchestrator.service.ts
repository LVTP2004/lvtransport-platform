import { PricingEngineService } from './pricing-engine.service';
import { BookingQuote, RouteEstimateInput } from '../models/pricing.types';

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

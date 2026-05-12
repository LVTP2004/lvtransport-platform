import { RouteFareEstimator } from '../estimators/route-fare.estimator.js';
import { QuoteStatus } from '../enums/fare-rule.enum.js';
import { BookingQuote, RouteEstimateInput } from '../models/pricing.types.js';

export class PricingEngineService {
  constructor(private readonly estimator = new RouteFareEstimator()) {}

  createQuote(input: RouteEstimateInput): BookingQuote {
    const now = new Date();
    return {
      quoteId: `quote_${now.getTime()}`,
      status: QuoteStatus.PREVIEW,
      input,
      breakdown: this.estimator.estimate(input),
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 10 * 60_000).toISOString(),
      pricingVersion: 'pricing-architecture-v1'
    };
  }
}

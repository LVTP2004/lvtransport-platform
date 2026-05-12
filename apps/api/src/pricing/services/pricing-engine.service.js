import { RouteFareEstimator } from '../estimators/route-fare.estimator.js';
import { QuoteStatus } from '../enums/fare-rule.enum.js';
export class PricingEngineService {
    estimator;
    constructor(estimator = new RouteFareEstimator()) {
        this.estimator = estimator;
    }
    createQuote(input) {
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

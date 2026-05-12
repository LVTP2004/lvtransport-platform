import { QuoteStatus, type BookingQuote, type RouteEstimateInput } from '../../../../../api/src/pricing';

export class PricingPreviewService {
  async fetchQuotePreview(input: RouteEstimateInput): Promise<BookingQuote> {
    return {
      quoteId: 'preview-placeholder',
      status: QuoteStatus.PREVIEW,
      input,
      breakdown: {
        currency: 'USD',
        baseAmount: 0,
        components: [],
        subtotal: 0,
        discountsTotal: 0,
        taxes: [],
        total: 0,
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
      pricingVersion: 'pricing-architecture-v1',
    };
  }
}

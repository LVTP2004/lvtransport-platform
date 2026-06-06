import { estimateRouteCost } from './route-estimator.js';
import { applyMinimumFare, calculateWaitingComponent, isNightWindow } from './fare-utils.js';
import { pricingConstants, pricingArchitectureFlags } from './constants.js';
import {
  BookingQuote,
  BookingQuoteRequest,
  FareBreakdown,
  FareRuleType,
  PricingEngineState,
  ServiceTier,
} from './models.js';

const tierMultiplier = (tier: ServiceTier): number => {
  if (tier === 'BUSINESS') return pricingConstants.businessTierMultiplier;
  if (tier === 'VIP') return pricingConstants.vipTierMultiplier;
  return 1;
};

export class PricingService {
  readonly state: PricingEngineState = {
    preparedForLiveRoutePricing: true,
    preparedForRealtimeDistancePricing: true,
    preparedForAiFareOptimization: true,
    preparedForSurgePricing: pricingArchitectureFlags.enableSurgePricingPreparation,
    ruleVersion: 'pricing-architecture-v1',
  };

  buildQuote(request: BookingQuoteRequest): BookingQuote {
    const routeEstimate = estimateRouteCost(request.route);
    const hour = new Date(request.requestedAt).getUTCHours();
    const nightMultiplier = isNightWindow(hour) ? pricingConstants.nightWindow.multiplier : 1;
    const waitingCharge = calculateWaitingComponent(request.waitingTimeMin ?? 0);

    let subtotal = routeEstimate.estimatedBaseCost * nightMultiplier * tierMultiplier(request.tier) + waitingCharge;

    if (request.route.airportZone) {
      subtotal += pricingConstants.airportSurchargeUsd;
    }

    if (routeEstimate.eligibleForLongDistancePricing) {
      subtotal *= pricingConstants.longDistanceMultiplier;
    }

    const { total: minProtectedTotal, minimumApplied } = applyMinimumFare(subtotal);

    const breakdown: FareBreakdown = {
      currency: pricingConstants.currency,
      subtotal,
      minimumFareApplied: minimumApplied,
      items: [
        { ruleType: FareRuleType.BASE_FARE, label: 'Base route estimate', amount: routeEstimate.estimatedBaseCost },
        { ruleType: FareRuleType.DAY_NIGHT_MULTIPLIER, label: 'Day/Night modifier', amount: routeEstimate.estimatedBaseCost * (nightMultiplier - 1) },
        { ruleType: FareRuleType.WAITING_TIME, label: 'Waiting time pricing', amount: waitingCharge },
      ],
      taxes: { taxAmount: 0, vatRatePct: pricingConstants.vatPreparationDefaultPct },
      total: minProtectedTotal,
    };

    return {
      quoteId: `quote_${request.bookingId}`,
      bookingId: request.bookingId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      assumptions: routeEstimate.assumptions,
      breakdown,
      futureRealtimeAdjustmentEnabled: pricingArchitectureFlags.enableRealtimeEtaAdjustmentPreparation,
    };
  }
}

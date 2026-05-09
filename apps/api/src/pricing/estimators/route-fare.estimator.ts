import { PRICING_CONSTANTS } from '../constants/pricing.config';
import { FareRuleType, PricingTier } from '../enums/fare-rule.enum';
import { FareComponent, RouteEstimateInput, TripCostBreakdown } from '../models/pricing.types';

export class RouteFareEstimator {
  estimate(input: RouteEstimateInput): TripCostBreakdown {
    const tier = input.tier ?? PricingTier.STANDARD;
    const components: FareComponent[] = [];

    components.push({ type: FareRuleType.BASE_FARE, label: 'Base fare', amount: PRICING_CONSTANTS.BASE_FARE });
    components.push({ type: FareRuleType.LONG_DISTANCE, label: 'Distance charge', amount: input.estimatedDistanceKm * PRICING_CONSTANTS.PER_KM_RATE });
    components.push({ type: FareRuleType.WAITING_TIME, label: 'Duration charge', amount: input.estimatedDurationMin * PRICING_CONSTANTS.PER_MIN_RATE });

    if (input.waitTimeMin) {
      components.push({ type: FareRuleType.WAITING_TIME, label: 'Waiting time', amount: input.waitTimeMin * PRICING_CONSTANTS.WAITING_PER_MIN });
    }

    if (input.isAirportRoute) {
      components.push({ type: FareRuleType.AIRPORT_SURCHARGE, label: 'Airport surcharge', amount: PRICING_CONSTANTS.AIRPORT_SURCHARGE });
    }

    if (input.isNight) {
      components.push({ type: FareRuleType.DAY_NIGHT_MULTIPLIER, label: 'Night pricing multiplier', amount: 0, metadata: { multiplier: PRICING_CONSTANTS.NIGHT_MULTIPLIER } });
    }

    if (tier === PricingTier.BUSINESS || tier === PricingTier.VIP) {
      components.push({ type: FareRuleType.BUSINESS_VIP, label: `${tier} multiplier`, amount: 0, metadata: { tier } });
    }

    const subtotal = components.reduce((acc, c) => acc + c.amount, 0);
    const total = Math.max(subtotal, PRICING_CONSTANTS.MINIMUM_FARE);

    return {
      currency: 'USD',
      baseAmount: PRICING_CONSTANTS.BASE_FARE,
      components,
      subtotal,
      discountsTotal: 0,
      taxes: [],
      total
    };
  }
}

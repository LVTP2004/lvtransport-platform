import { PRICING_CONSTANTS } from '../constants/pricing.config';
import { FareRuleType, PricingTier } from '../enums/fare-rule.enum';
import { FareComponent, RouteEstimateInput, TripCostBreakdown } from '../models/pricing.types';

interface PricingContext {
  input: RouteEstimateInput;
  components: FareComponent[];
  subtotal: number;
}

interface PricingRule {
  apply(context: PricingContext): void;
}

class DayNightTariffRule implements PricingRule {
  apply(context: PricingContext): void {
    if (!context.input.isNight) return;

    const multiplier = PRICING_CONSTANTS.NIGHT_MULTIPLIER;
    const increase = context.subtotal * (multiplier - 1);

    context.components.push({
      type: FareRuleType.DAY_NIGHT_MULTIPLIER,
      label: 'Night tariff adjustment',
      amount: increase,
      metadata: { multiplier }
    });

    context.subtotal += increase;
  }
}

class AirportSurchargeRule implements PricingRule {
  apply(context: PricingContext): void {
    if (!context.input.isAirportRoute) return;

    context.components.push({
      type: FareRuleType.AIRPORT_SURCHARGE,
      label: 'Airport surcharge',
      amount: PRICING_CONSTANTS.AIRPORT_SURCHARGE
    });

    context.subtotal += PRICING_CONSTANTS.AIRPORT_SURCHARGE;
  }
}

class LongDistanceRule implements PricingRule {
  apply(context: PricingContext): void {
    if (context.input.estimatedDistanceKm <= PRICING_CONSTANTS.LONG_DISTANCE_THRESHOLD_KM) return;

    const distanceCharge = context.input.estimatedDistanceKm * PRICING_CONSTANTS.PER_KM_RATE;
    const adjustment = distanceCharge * (PRICING_CONSTANTS.LONG_DISTANCE_DISCOUNT_MULTIPLIER - 1);

    context.components.push({
      type: FareRuleType.LONG_DISTANCE,
      label: 'Long distance adjustment',
      amount: adjustment,
      metadata: {
        thresholdKm: PRICING_CONSTANTS.LONG_DISTANCE_THRESHOLD_KM,
        multiplier: PRICING_CONSTANTS.LONG_DISTANCE_DISCOUNT_MULTIPLIER
      }
    });

    context.subtotal += adjustment;
  }
}

class VipBusinessPricingRule implements PricingRule {
  apply(context: PricingContext): void {
    const tier = context.input.tier ?? PricingTier.STANDARD;
    if (tier === PricingTier.STANDARD) return;

    const multiplier = tier === PricingTier.BUSINESS ? PRICING_CONSTANTS.BUSINESS_MULTIPLIER : PRICING_CONSTANTS.VIP_MULTIPLIER;
    const adjustment = context.subtotal * (multiplier - 1);

    context.components.push({
      type: FareRuleType.BUSINESS_VIP,
      label: `${tier} pricing adjustment`,
      amount: adjustment,
      metadata: { tier, multiplier }
    });

    context.subtotal += adjustment;
  }
}

class MinimumFareRule implements PricingRule {
  apply(context: PricingContext): void {
    if (context.subtotal >= PRICING_CONSTANTS.MINIMUM_FARE) return;

    const adjustment = PRICING_CONSTANTS.MINIMUM_FARE - context.subtotal;
    context.components.push({
      type: FareRuleType.MINIMUM_FARE,
      label: 'Minimum fare adjustment',
      amount: adjustment,
      metadata: { minimumFare: PRICING_CONSTANTS.MINIMUM_FARE }
    });

    context.subtotal = PRICING_CONSTANTS.MINIMUM_FARE;
  }
}

export class CentralizedPricingEngineService {
  private readonly rules: PricingRule[] = [
    new DayNightTariffRule(),
    new AirportSurchargeRule(),
    new LongDistanceRule(),
    new VipBusinessPricingRule(),
    new MinimumFareRule()
  ];

  calculateBreakdown(input: RouteEstimateInput): TripCostBreakdown {
    const components: FareComponent[] = [];

    const baseFare = PRICING_CONSTANTS.BASE_FARE;
    const distanceCharge = input.estimatedDistanceKm * PRICING_CONSTANTS.PER_KM_RATE;
    const durationCharge = input.estimatedDurationMin * PRICING_CONSTANTS.PER_MIN_RATE;

    components.push({ type: FareRuleType.BASE_FARE, label: 'Base fare', amount: baseFare });
    components.push({ type: FareRuleType.LONG_DISTANCE, label: 'Distance charge', amount: distanceCharge });
    components.push({ type: FareRuleType.WAITING_TIME, label: 'Duration charge', amount: durationCharge });

    let subtotal = baseFare + distanceCharge + durationCharge;

    if (input.waitTimeMin) {
      const waitingCharge = input.waitTimeMin * PRICING_CONSTANTS.WAITING_PER_MIN;
      components.push({ type: FareRuleType.WAITING_TIME, label: 'Waiting time', amount: waitingCharge });
      subtotal += waitingCharge;
    }

    const context: PricingContext = { input, components, subtotal };
    this.rules.forEach((rule) => rule.apply(context));

    return {
      currency: 'USD',
      baseAmount: PRICING_CONSTANTS.BASE_FARE,
      components,
      subtotal: context.subtotal,
      discountsTotal: 0,
      taxes: [],
      total: context.subtotal
    };
  }
}

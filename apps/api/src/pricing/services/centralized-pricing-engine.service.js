import { PRICING_CONSTANTS } from '../constants/pricing.config.js';
import { FareRuleType, PricingTier } from '../enums/fare-rule.enum.js';
class AirportSurchargeRule {
    apply(context) {
        if (!context.input.isAirportRoute)
            return;
        context.components.push({ type: FareRuleType.AIRPORT_SURCHARGE, label: 'Airport surcharge', amount: PRICING_CONSTANTS.AIRPORT_SURCHARGE });
        context.subtotal += PRICING_CONSTANTS.AIRPORT_SURCHARGE;
    }
}
class NightRule {
    apply(context) {
        if (!context.input.isNight)
            return;
        const increase = context.subtotal * (PRICING_CONSTANTS.NIGHT_MULTIPLIER - 1);
        context.components.push({ type: FareRuleType.DAY_NIGHT_MULTIPLIER, label: 'Night tariff adjustment', amount: increase, metadata: { multiplier: PRICING_CONSTANTS.NIGHT_MULTIPLIER } });
        context.subtotal += increase;
    }
}
class EtaOperationalRule {
    apply(context) {
        if (!context.input.etaDelayMin || context.input.etaDelayMin <= 0)
            return;
        const amount = context.input.etaDelayMin * PRICING_CONSTANTS.WAITING_PER_MIN;
        context.components.push({ type: FareRuleType.WAITING_TIME, label: 'ETA operational adjustment', amount, metadata: { etaDelayMin: context.input.etaDelayMin } });
        context.subtotal += amount;
    }
}
class TierRule {
    apply(context) {
        const tier = context.input.tier ?? PricingTier.STANDARD;
        if (tier === PricingTier.STANDARD)
            return;
        const multiplier = tier === PricingTier.BUSINESS ? PRICING_CONSTANTS.BUSINESS_MULTIPLIER : PRICING_CONSTANTS.VIP_MULTIPLIER;
        const amount = context.subtotal * (multiplier - 1);
        context.components.push({ type: FareRuleType.BUSINESS_VIP, label: `${tier} pricing adjustment`, amount, metadata: { tier, multiplier } });
        context.subtotal += amount;
    }
}
class MinimumFareRule {
    apply(context) {
        if (context.subtotal >= PRICING_CONSTANTS.MINIMUM_FARE)
            return;
        const amount = PRICING_CONSTANTS.MINIMUM_FARE - context.subtotal;
        context.components.push({ type: FareRuleType.MINIMUM_FARE, label: 'Operational minimum fare adjustment', amount });
        context.subtotal = PRICING_CONSTANTS.MINIMUM_FARE;
        context.minimumApplied = true;
    }
}
export class CentralizedPricingEngineService {
    rules = [new AirportSurchargeRule(), new NightRule(), new EtaOperationalRule(), new TierRule(), new MinimumFareRule()];
    calculateBreakdown(input) {
        const components = [];
        const base = PRICING_CONSTANTS.BASE_FARE;
        const distance = input.estimatedDistanceKm * PRICING_CONSTANTS.PER_KM_RATE;
        const duration = input.estimatedDurationMin * PRICING_CONSTANTS.PER_MIN_RATE;
        components.push({ type: FareRuleType.BASE_FARE, label: 'Base fare', amount: base });
        components.push({ type: FareRuleType.LONG_DISTANCE, label: 'Distance charge', amount: distance });
        components.push({ type: FareRuleType.WAITING_TIME, label: 'Duration charge', amount: duration });
        if (input.waitTimeMin && input.waitTimeMin > 0) {
            const waiting = input.waitTimeMin * PRICING_CONSTANTS.WAITING_PER_MIN;
            components.push({ type: FareRuleType.WAITING_TIME, label: 'Waiting time', amount: waiting });
            // included in initial subtotal assembly below
        }
        const context = { input, components, subtotal: base + distance + duration + ((input.waitTimeMin && input.waitTimeMin > 0) ? (input.waitTimeMin * PRICING_CONSTANTS.WAITING_PER_MIN) : 0), minimumApplied: false };
        this.rules.forEach((rule) => rule.apply(context));
        return {
            currency: 'USD',
            baseAmount: base,
            components,
            subtotal: context.subtotal,
            discountsTotal: 0,
            taxes: [],
            total: Number(context.subtotal.toFixed(2)),
            diagnostics: {
                operationalMinimumApplied: context.minimumApplied,
                realtimeRecalculationReady: true,
                pricingVersion: PRICING_CONSTANTS.VERSION
            }
        };
    }
}

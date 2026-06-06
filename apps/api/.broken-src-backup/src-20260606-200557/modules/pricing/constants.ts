export const pricingConstants = {
  currency: 'USD',
  baseFareUsd: 8,
  minFareUsd: 15,
  perKmUsd: 2.1,
  perMinuteUsd: 0.45,
  waitingPerMinuteUsd: 0.65,
  airportSurchargeUsd: 7,
  longDistanceThresholdKm: 25,
  longDistanceMultiplier: 1.12,
  nightWindow: {
    startHour: 22,
    endHour: 6,
    multiplier: 1.15,
  },
  businessTierMultiplier: 1.2,
  vipTierMultiplier: 1.4,
  commissionRatePct: 18,
  vatPreparationDefaultPct: 0,
} as const;

export const pricingArchitectureFlags = {
  enableRealtimeEtaAdjustmentPreparation: true,
  enableSurgePricingPreparation: true,
  enableAirportFixedRatePreparation: true,
  enableSubscriptionPricingPreparation: true,
  enablePromoAndDiscountPreparation: true,
  enableDriverPayoutPreparation: true,
};

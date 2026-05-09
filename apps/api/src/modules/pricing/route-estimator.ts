import { pricingConstants } from './constants';
import { calculateDistanceComponent, calculateDurationComponent } from './fare-utils';
import { RouteEstimateInput } from './models';

export interface RouteEstimateResult {
  estimatedBaseCost: number;
  eligibleForLongDistancePricing: boolean;
  assumptions: string[];
}

export const estimateRouteCost = (input: RouteEstimateInput): RouteEstimateResult => {
  const estimatedBaseCost =
    pricingConstants.baseFareUsd +
    calculateDistanceComponent(input.estimatedDistanceKm) +
    calculateDurationComponent(input.estimatedDurationMin);

  return {
    estimatedBaseCost,
    eligibleForLongDistancePricing: input.estimatedDistanceKm >= pricingConstants.longDistanceThresholdKm,
    assumptions: [
      'No external distance API requests executed.',
      'ETA adjustment logic is architecture-only and prepared for realtime enablement.',
      'Future AI fare optimization hooks are defined outside runtime billing logic.',
    ],
  };
};

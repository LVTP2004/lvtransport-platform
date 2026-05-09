import { pricingConstants } from './constants';

export const isNightWindow = (hour24: number): boolean =>
  hour24 >= pricingConstants.nightWindow.startHour || hour24 < pricingConstants.nightWindow.endHour;

export const calculateDistanceComponent = (distanceKm: number): number =>
  distanceKm * pricingConstants.perKmUsd;

export const calculateDurationComponent = (durationMin: number): number =>
  durationMin * pricingConstants.perMinuteUsd;

export const calculateWaitingComponent = (waitingMin: number): number =>
  Math.max(waitingMin, 0) * pricingConstants.waitingPerMinuteUsd;

export const applyMinimumFare = (rawFare: number): { total: number; minimumApplied: boolean } => {
  if (rawFare >= pricingConstants.minFareUsd) {
    return { total: rawFare, minimumApplied: false };
  }

  return { total: pricingConstants.minFareUsd, minimumApplied: true };
};

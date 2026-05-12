import { FareComponent } from '../models/pricing.types.js';

export const PricingCalculationUtil = {
  sumComponents(components: FareComponent[]): number {
    return components.reduce((acc, component) => acc + component.amount, 0);
  },
  applyPercentage(amount: number, percentage: number): number {
    return amount * percentage;
  },
  applyMinimum(amount: number, minimum: number): number {
    return Math.max(amount, minimum);
  }
};

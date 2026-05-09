export const PricingCalculationUtil = {
    sumComponents(components) {
        return components.reduce((acc, component) => acc + component.amount, 0);
    },
    applyPercentage(amount, percentage) {
        return amount * percentage;
    },
    applyMinimum(amount, minimum) {
        return Math.max(amount, minimum);
    }
};

export const sumComponents = (breakdown) => Number(breakdown.components.reduce((acc, c) => acc + c.amount, 0).toFixed(2));
export const buildPricingDiagnostics = (breakdown) => {
    const diagnostics = [];
    if (breakdown.diagnostics.operationalMinimumApplied)
        diagnostics.push('minimum_fare_applied');
    if (breakdown.diagnostics.realtimeRecalculationReady)
        diagnostics.push('realtime_recalculation_ready');
    diagnostics.push(`pricing_version:${breakdown.diagnostics.pricingVersion}`);
    return diagnostics;
};

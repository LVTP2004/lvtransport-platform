import { integrationReadinessService } from './integration-readiness.service.js';
import { operationalAnalyticsService } from './operational-analytics.service.js';

export type ScorecardMetric = {
  key: string;
  label: string;
  score: number;
  rationale: string;
};

export type FinalEcosystemScorecard = {
  generatedAt: string;
  overallProductionMaturity: number;
  metrics: ScorecardMetric[];
};

const clamp = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const pct = (numerator: number, denominator: number): number => (denominator > 0 ? (numerator / denominator) * 100 : 0);

export const finalEcosystemScorecardService = {
  getScorecard(): FinalEcosystemScorecard {
    const readiness = integrationReadinessService.getSnapshot();
    const analytics = operationalAnalyticsService.getAdminSnapshot();

    const completion = analytics.bookingAnalytics.completionRate * 100;
    const assignmentAcceptance = analytics.dispatchEfficiency.acceptanceRate * 100;
    const totalDrivers = analytics.realtime.driverOnline || 1;
    const busyRatio = analytics.realtime.driverBusy / totalDrivers;
    const providerReady = [...readiness.payments, ...readiness.email, ...readiness.maps].filter((i) => i.state === 'ready').length;
    const providerTotal = [...readiness.payments, ...readiness.email, ...readiness.maps].length;
    const providerReadiness = pct(providerReady, providerTotal);

    const metrics: ScorecardMetric[] = [
      { key: 'runtime_stability', label: 'Runtime stability', score: clamp((completion * 0.6) + (assignmentAcceptance * 0.4)), rationale: 'Completion rate blended with assignment acceptance.' },
      { key: 'realtime_synchronization', label: 'Realtime synchronization', score: clamp((completion * 0.5) + ((100 - analytics.dispatchEfficiency.averageAssignmentResponseSeconds) * 0.5)), rationale: 'Uses booking completion and assignment response latency guardrail.' },
      { key: 'fullscreen_maps', label: 'Fullscreen maps', score: clamp((providerReadiness * 0.7) + (completion * 0.3)), rationale: 'Maps provider readiness weighted against successful trip completion.' },
      { key: 'gps_reliability', label: 'GPS reliability', score: clamp((providerReadiness * 0.5) + (assignmentAcceptance * 0.5)), rationale: 'Provider readiness and field dispatch outcomes indicate tracking reliability.' },
      { key: 'lv_messenger_integration', label: 'LV Messenger integration', score: clamp(completion), rationale: 'Messenger confidence follows lifecycle continuity through to completion.' },
      { key: 'lv_pay_readiness', label: 'LV Pay readiness', score: clamp(pct(readiness.payments.filter((p) => p.state === 'ready').length, readiness.payments.length)), rationale: 'Directly driven by payment integration readiness checks.' },
      { key: 'airport_intelligence_maturity', label: 'Airport intelligence maturity', score: clamp((completion * 0.5) + (providerReadiness * 0.5)), rationale: 'Airport orchestration depends on completed flows and map/data providers.' },
      { key: 'moni_operational_maturity', label: 'Moni Ride operational maturity', score: clamp((completion * 0.7) + (assignmentAcceptance * 0.3)), rationale: 'Moni effectiveness depends on successful lifecycle and driver responsiveness.' },
      { key: 'mobile_pwa_quality', label: 'Mobile/PWA quality', score: clamp((providerReadiness * 0.4) + (completion * 0.6)), rationale: 'PWA quality correlates with stable flow and provider availability.' },
      { key: 'security_gdpr_readiness', label: 'Security/GDPR readiness', score: clamp(providerReadiness), rationale: 'Operational readiness snapshot requires configured secure providers and env.' },
      { key: 'recovery_readiness', label: 'Recovery readiness', score: clamp((100 - (busyRatio * 100 * 0.5)) + (completion * 0.5)), rationale: 'Recovery confidence increases with balanced utilization and successful completions.' },
      { key: 'operational_trust_quality', label: 'Operational trust quality', score: clamp((completion * 0.5) + (assignmentAcceptance * 0.5)), rationale: 'Trust built via successful rides and responsive dispatch.' },
      { key: 'founder_operational_readiness', label: 'Founder operational readiness', score: clamp((completion * 0.4) + (providerReadiness * 0.6)), rationale: 'Founder operations require stable integrations and successful ride outcomes.' },
      { key: 'pilot_operation_readiness', label: 'Pilot operation readiness', score: clamp((completion * 0.5) + (assignmentAcceptance * 0.3) + (providerReadiness * 0.2)), rationale: 'Pilot readiness blends lifecycle success, driver response, and provider readiness.' },
    ];

    const overallProductionMaturity = clamp(metrics.reduce((acc, metric) => acc + metric.score, 0) / metrics.length);

    return {
      generatedAt: new Date().toISOString(),
      overallProductionMaturity,
      metrics: [...metrics, { key: 'overall_production_maturity', label: 'Overall production maturity', score: overallProductionMaturity, rationale: 'Average of the 14 scored operational dimensions.' }]
    };
  }
};

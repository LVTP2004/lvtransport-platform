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
      { key: 'realtime_reliability', label: 'Realtime reliability', score: clamp((completion * 0.65) + (assignmentAcceptance * 0.35)), rationale: 'Lifecycle completion remains the strongest reliability signal, balanced with dispatch acceptance.' },
      { key: 'reconnect_resilience', label: 'Reconnect resilience', score: clamp((completion * 0.5) + ((100 - analytics.dispatchEfficiency.averageAssignmentResponseSeconds) * 0.5)), rationale: 'Reconnect behavior is inferred through continuity and bounded response latency.' },
      { key: 'airport_operational_maturity', label: 'Airport operational maturity', score: clamp((completion * 0.55) + (providerReadiness * 0.45)), rationale: 'Airport operations depend on coordinated lifecycle execution and map/provider readiness.' },
      { key: 'payment_trust', label: 'Payment trust', score: clamp((pct(readiness.payments.filter((p) => p.state === 'ready').length, readiness.payments.length) * 0.7) + (completion * 0.3)), rationale: 'Payment trust combines provider readiness with verified completed rides.' },
      { key: 'lifecycle_integrity', label: 'Lifecycle integrity', score: clamp(completion), rationale: 'Lifecycle integrity tracks rides reaching completed state without churn.' },
      { key: 'moni_calmness', label: 'Moni calmness', score: clamp((completion * 0.7) + (assignmentAcceptance * 0.3)), rationale: 'Moni calmness requires smooth ride progression and fast driver acceptance outcomes.' },
      { key: 'founder_visibility_quality', label: 'Founder visibility quality', score: clamp((completion * 0.35) + (providerReadiness * 0.65)), rationale: 'Founder visibility quality prioritizes trustworthy provider integrations and clear operational continuity.' },
      { key: 'operational_simplicity', label: 'Operational simplicity', score: clamp((providerReadiness * 0.6) + (assignmentAcceptance * 0.4)), rationale: 'Simplicity improves when integrations are stable and dispatch loops are predictable.' },
      { key: 'runtime_recovery_discipline', label: 'Runtime recovery discipline', score: clamp((100 - (busyRatio * 100 * 0.5)) + (completion * 0.5)), rationale: 'Recovery discipline improves with balanced capacity and consistent completion rates.' },
      { key: 'emotional_trust_preservation', label: 'Emotional trust preservation', score: clamp((completion * 0.5) + (assignmentAcceptance * 0.5)), rationale: 'Customer trust follows timely driver response and successful trip completion.' },
    ];

    const overallProductionMaturity = clamp(metrics.reduce((acc, metric) => acc + metric.score, 0) / metrics.length);

    return {
      generatedAt: new Date().toISOString(),
      overallProductionMaturity,
      metrics: [...metrics, { key: 'overall_production_maturity', label: 'Overall production maturity', score: overallProductionMaturity, rationale: 'Average of the 10 scored operational dimensions.' }]
    };
  }
};

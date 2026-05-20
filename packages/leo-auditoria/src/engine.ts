import type {
  FounderExecutiveReport,
  LeoAnomaly,
  LifecycleAuditRecord,
  OperationalScorecard,
  RuntimeSignal,
  WeaknessChain
} from './types.js';

const clampScore = (score: number): number => Math.max(0, Math.min(100, Math.round(score)));

const severityFromPressure = (pressure: number): LeoAnomaly['severity'] => {
  if (pressure >= 85) return 'critical';
  if (pressure >= 70) return 'high';
  if (pressure >= 45) return 'medium';
  return 'low';
};

export const buildOperationalPulse = (signals: RuntimeSignal[]): string => {
  if (!signals.length) return 'stable';
  const pressure = signals.reduce((sum, signal) => {
    const threshold = signal.threshold ?? 1;
    return sum + Math.max(0, signal.value / threshold);
  }, 0) / signals.length;

  if (pressure >= 2.5) return 'critical instability';
  if (pressure >= 1.6) return 'degraded with reconnect stress';
  if (pressure >= 1.1) return 'watch mode';
  return 'stable with minor variance';
};

export const deriveLifecycleIntegrity = (records: LifecycleAuditRecord[]): number => {
  if (!records.length) return 100;

  const byBooking = new Map<string, LifecycleAuditRecord[]>();
  for (const entry of records) {
    const existing = byBooking.get(entry.bookingId) ?? [];
    existing.push(entry);
    byBooking.set(entry.bookingId, existing);
  }

  let penalties = 0;
  for (const [, bookingRecords] of byBooking) {
    const seen = new Set<string>();
    for (const record of bookingRecords) {
      const marker = `${record.state}:${record.timestamp}`;
      if (seen.has(marker)) penalties += 4;
      seen.add(marker);
    }
  }

  return clampScore(100 - penalties);
};

export const computeScorecard = (input: {
  runtimeSignals: RuntimeSignal[];
  lifecycleRecords: LifecycleAuditRecord[];
  weaknessChains: WeaknessChain[];
  moniDiscipline: number;
  airportMaturity: number;
  paymentReliability: number;
  founderVisibility: number;
  ecosystemCoherence: number;
  experimentalIsolationDiscipline: number;
}): OperationalScorecard => {
  const pulse = buildOperationalPulse(input.runtimeSignals);
  const runtimeResilienceBase = pulse === 'critical instability' ? 42 : pulse === 'degraded with reconnect stress' ? 64 : pulse === 'watch mode' ? 80 : 92;

  const chainPenalty = input.weaknessChains.filter((item) => item.severity === 'critical').length * 6;

  const runtimeResilience = clampScore(runtimeResilienceBase - chainPenalty);
  const realtimeSynchronization = clampScore(runtimeResilience - Math.round(chainPenalty / 2));
  const lifecycleTruthIntegrity = deriveLifecycleIntegrity(input.lifecycleRecords);
  const operationalCalmness = clampScore((runtimeResilience + input.moniDiscipline + input.founderVisibility) / 3 - chainPenalty / 2);
  const simplificationOpportunity = clampScore(100 - operationalCalmness + input.weaknessChains.length * 3);

  return {
    runtimeResilience,
    lifecycleTruthIntegrity,
    moniDiscipline: clampScore(input.moniDiscipline),
    airportMaturity: clampScore(input.airportMaturity),
    paymentReliability: clampScore(input.paymentReliability),
    realtimeSynchronization,
    founderVisibility: clampScore(input.founderVisibility),
    operationalCalmness,
    ecosystemCoherence: clampScore(input.ecosystemCoherence),
    simplificationOpportunity,
    experimentalIsolationDiscipline: clampScore(input.experimentalIsolationDiscipline)
  };
};

export const toExecutiveReport = (params: {
  runtimeSignals: RuntimeSignal[];
  anomalies: LeoAnomaly[];
  weaknessChains: WeaknessChain[];
  scorecard: OperationalScorecard;
}): FounderExecutiveReport => ({
  generatedAt: new Date().toISOString(),
  operationalPulse: buildOperationalPulse(params.runtimeSignals),
  activeAnomalies: params.anomalies,
  weaknessChains: params.weaknessChains,
  scorecard: params.scorecard,
  answers: {
    unstable: params.anomalies[0]?.summary ?? 'No instability detected.',
    trustThreat: params.weaknessChains[0]?.rootCause ?? 'No trust threat identified.',
    overcomplicated: 'Reconnect + synchronization telemetry overlap across subsystems.',
    simplifyNow: params.weaknessChains[0]?.simplificationRecommendation ?? 'Consolidate duplicated observability streams.',
    subsystemAttention: params.weaknessChains[0]?.ownerSubsystem ?? 'No subsystem currently in alert state.',
    emergingWeaknessChain: params.weaknessChains[0]?.linkedEvents.join(' -> ') ?? 'None',
    improving: 'Lifecycle audit consistency is trending upward with reduced duplication.',
    shouldNotScaleYet: 'Any workflow with unresolved critical weakness chains.'
  }
});

export const buildAnomalyFromSignal = (signal: RuntimeSignal): LeoAnomaly => {
  const threshold = signal.threshold ?? 1;
  const pressure = (signal.value / threshold) * 100;

  return {
    id: `anomaly_${signal.metric}_${signal.timestamp}`,
    phase: 'runtime_observation',
    severity: severityFromPressure(pressure),
    title: `Runtime deviation: ${signal.metric}`,
    summary: `${signal.metric} reported value ${signal.value} with threshold ${threshold}.`,
    subsystems: [signal.subsystem],
    recommendations: ['Observe trend for 15 minutes', 'Correlate with weakness-chain graph', 'Escalate only if severity persists'],
    createdAt: signal.timestamp
  };
};

export type ForecastSignal = { key: string; values: number[]; evidenceRefs: string[] };

export class OperationalForecastEngine {
  generate(signal: ForecastSignal) {
    if (!signal.values.length) {
      return { insufficientEvidence: true, deterministicReasoning: 'No historical values supplied.', evidenceReferences: signal.evidenceRefs, confidenceBoundary: 'low' };
    }
    const trend = signal.values[signal.values.length - 1] - signal.values[0];
    const projection = signal.values[signal.values.length - 1] + trend;
    return {
      insufficientEvidence: false,
      forecastKey: signal.key,
      projection,
      confidenceBoundary: signal.values.length >= 4 ? 'bounded-medium' : 'bounded-low',
      evidenceReferences: [...signal.evidenceRefs].sort(),
      deterministicReasoning: `Projection=${signal.values[signal.values.length - 1]} + trend(${trend}).`
    };
  }
}

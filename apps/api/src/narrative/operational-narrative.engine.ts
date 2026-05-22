import type { EvidenceRef } from '../ai/incident-cognition/incident-cognition.engine';
export class OperationalNarrativeEngine {
  generate(input: { title: string; events: Array<{ timestamp: string; detail: string; evidence: EvidenceRef[] }>; lineage: EvidenceRef[] }) {
    const insufficientEvidence = input.events.some((e) => e.evidence.length === 0);
    return {
      title: input.title,
      timeline: input.events.map((e) => `${e.timestamp}: ${e.detail}`),
      evidenceReferences: input.events.flatMap((e) => e.evidence),
      lineage: input.lineage,
      confidenceBoundaries: insufficientEvidence ? 'bounded-low-confidence' : 'bounded-source-complete',
      insufficientEvidence
    };
  }
}

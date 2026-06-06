import type { EvidenceRef } from '../incident-cognition/incident-cognition.engine';
export type AnomalyRecord = { code: string; severity: 'low'|'medium'|'high'; reason: string; linkedEvidence: EvidenceRef[]; lineage: EvidenceRef[] };
export class OperationalAnomalyEngine {
  scan(input: { replays: number; approvalFailures: number; lineageGaps: number; missingEvidence: number; rejectionRate: number; evidence: EvidenceRef[]; lineage: EvidenceRef[] }): AnomalyRecord[] {
    const anomalies: AnomalyRecord[] = [];
    if (input.replays > 3) anomalies.push({ code:'replay_spike', severity:'high', reason:'Replay count above deterministic threshold', linkedEvidence: input.evidence, lineage: input.lineage });
    if (input.approvalFailures > 0) anomalies.push({ code:'approval_failures', severity:'high', reason:'Approval failures present', linkedEvidence: input.evidence, lineage: input.lineage });
    if (input.lineageGaps > 0) anomalies.push({ code:'lineage_gaps', severity:'medium', reason:'Lineage gaps detected', linkedEvidence: input.evidence, lineage: input.lineage });
    if (input.missingEvidence > 0) anomalies.push({ code:'missing_evidence', severity:'medium', reason:'Required evidence missing', linkedEvidence: input.evidence, lineage: input.lineage });
    if (input.rejectionRate > 0.35) anomalies.push({ code:'abnormal_rejections', severity:'medium', reason:'Execution rejection threshold exceeded', linkedEvidence: input.evidence, lineage: input.lineage });
    return anomalies;
  }
}

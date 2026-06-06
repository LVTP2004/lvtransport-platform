import type { EvidenceRef } from '../ai/incident-cognition/incident-cognition.engine';
export type LineageViolation = { type: string; message: string; refs: EvidenceRef[] };
export class LineageIntegrityService {
  verify(input: { evidence: EvidenceRef[]; lineage: EvidenceRef[]; approvals: EvidenceRef[]; replayLineage: EvidenceRef[] }) {
    const violations: LineageViolation[] = [];
    const lineageIds = new Set(input.lineage.map((x) => x.id));
    const orphanEvidence = input.evidence.filter((x) => !lineageIds.has(x.id));
    if (orphanEvidence.length) violations.push({ type: 'orphan_evidence', message: 'Evidence not connected to lineage', refs: orphanEvidence });
    if (!input.approvals.length) violations.push({ type: 'invalid_approval_chain', message: 'No approval chain records', refs: [] });
    if (!input.replayLineage.length) violations.push({ type: 'missing_replay_lineage', message: 'Replay lineage unavailable', refs: [] });
    return { valid: violations.length === 0, violations };
  }
}

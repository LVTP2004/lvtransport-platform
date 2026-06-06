export type EvidenceRef = { source: string; id: string };
export type IncidentSourceBundle = {
  incidentId: string;
  operationalMemoryIndex: EvidenceRef[];
  executionLedger: EvidenceRef[];
  incidentTimeline: EvidenceRef[];
  evidenceGraph: EvidenceRef[];
  governanceApprovals: EvidenceRef[];
  lineageRefs: EvidenceRef[];
};

export type IncidentCognitionOutput = {
  incidentId: string;
  severityClassification: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  escalationRecommendation: 'manual-review' | 'notify-oncall' | 'executive-brief';
  impactedEntities: string[];
  missingEvidenceReport: string[];
  operatorReviewChecklist: string[];
  evidenceReferences: EvidenceRef[];
  lineageReferences: EvidenceRef[];
  insufficientEvidence: boolean;
};

export class IncidentCognitionEngine {
  analyze(input: IncidentSourceBundle): IncidentCognitionOutput {
    const evidenceReferences = [
      ...input.operationalMemoryIndex,
      ...input.executionLedger,
      ...input.incidentTimeline,
      ...input.evidenceGraph,
      ...input.governanceApprovals
    ];
    const missingEvidenceReport: string[] = [];
    if (!input.executionLedger.length) missingEvidenceReport.push('executionLedger');
    if (!input.incidentTimeline.length) missingEvidenceReport.push('incidentTimeline');
    if (!input.evidenceGraph.length) missingEvidenceReport.push('evidenceGraph');

    const insufficientEvidence = missingEvidenceReport.length > 0;
    const severityClassification = insufficientEvidence ? 'unknown' : evidenceReferences.length > 20 ? 'critical' : evidenceReferences.length > 12 ? 'high' : evidenceReferences.length > 6 ? 'medium' : 'low';
    const escalationRecommendation = severityClassification === 'critical' ? 'executive-brief' : severityClassification === 'high' ? 'notify-oncall' : 'manual-review';

    return {
      incidentId: input.incidentId,
      severityClassification,
      escalationRecommendation,
      impactedEntities: Array.from(new Set(evidenceReferences.map((ref) => ref.source))).sort(),
      missingEvidenceReport,
      operatorReviewChecklist: [
        'Validate timeline completeness against immutable records',
        'Confirm approvals and governance checkpoints are present',
        'Review lineage references for orphaned links'
      ],
      evidenceReferences,
      lineageReferences: input.lineageRefs,
      insufficientEvidence
    };
  }
}

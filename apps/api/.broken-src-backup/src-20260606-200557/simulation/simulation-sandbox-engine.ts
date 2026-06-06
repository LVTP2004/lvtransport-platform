export type SimulationMode = 'transition' | 'replay' | 'escalation' | 'synchronization' | 'approval';
export type SimulationInput = { mode: SimulationMode; evidence: string[]; stateSnapshotId: string };

export class SimulationSandboxEngine {
  run(input: SimulationInput) {
    const sortedEvidence = [...input.evidence].sort();
    const consequences = sortedEvidence.map((e, index) => `consequence-${input.mode}-${index + 1}:${e}`);
    return Object.freeze({
      mode: input.mode,
      stateSnapshotId: input.stateSnapshotId,
      hypotheticalEvidenceTree: sortedEvidence,
      deterministicConsequences: consequences,
      governanceViolations: consequences.filter((entry) => entry.includes('violation')),
      requiredApprovals: input.mode === 'approval' ? ['ops-lead', 'governance-officer'] : []
    });
  }
}

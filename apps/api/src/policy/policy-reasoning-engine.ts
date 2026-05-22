export type PolicyDocument = { id: string; title: string; constraints: string[] };

export class PolicyReasoningEngine {
  constructor(private readonly policies: PolicyDocument[]) {}

  lookup(term: string) {
    return this.policies.filter((p) => p.title.toLowerCase().includes(term.toLowerCase()) || p.constraints.some((c) => c.toLowerCase().includes(term.toLowerCase())));
  }

  explain(policyId: string) {
    const policy = this.policies.find((p) => p.id === policyId);
    if (!policy) return { insufficientEvidence: true, message: 'Policy not found in explicit source set.' };
    return { insufficientEvidence: false, policyReferences: [policy.id], sourceCitations: [policy.title], lineage: 'local-policy-catalog', explanation: policy.constraints.join('; ') };
  }
}

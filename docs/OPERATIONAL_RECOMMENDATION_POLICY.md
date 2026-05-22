# Operational Recommendation Policy

## Advisory-only philosophy
LVTransport operational recommendation panels are read-only cognition aids for operators. They surface deterministic evidence interpretations and never execute actions.

## Deterministic recommendation rules
Recommendations are generated from explicit rule matches only:
- Rule INT-CHK-01: integrity checksum warning -> Integrity warning
- Rule TRN-EVD-02: missing transition proof -> Transition anomaly
- Rule RPL-GRD-03: replay guard warning -> Replay caution
- Rule MIG-LIN-04: missing migration lineage -> Missing lineage
- Rule OPS-COR-05: warning evidence missing correlation_id -> Correlation mismatch
- Rule EVD-COMP-06: incomplete artifact set -> Missing evidence / insufficient evidence

No LLM inference, speculative generation, probabilistic scoring, or hidden-state estimation is allowed.

## Evidence requirements
Each recommendation must expose:
- recommendation type
- triggering evidence
- source lineage
- correlation_id and/or request_id when available
- related runbook reference when available
- deterministic reason (rule identifier + reason)

Recommendations disappear when triggering evidence is absent.

## Insufficient-evidence handling
When required evidence is incomplete, panels must show explicit insufficient-evidence status. The UI must not:
- invent causes
- fabricate incidents
- infer hidden operational state

## Operator supervision guarantees
Operational recommendation panels must reinforce:
- operator decision required
- no automatic execution
- no replay execution
- no mutation
- no autonomous escalation

## Explicit autonomous-action prohibition
This capability is strictly UI-only and advisory-only. It does not introduce or enable backend orchestration, realtime pathways, queue/worker execution, autonomous mutation systems, or generative AI integrations.

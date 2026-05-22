# Incident Intelligence Runtime

## Objective
Provide bounded, evidence-first incident cognition with deterministic classification.

## Required Output Contract
Every incident intelligence output MUST include:
- evidence[]
- lineageRefs[]
- classification (deterministic rule set)
- insufficientEvidence (boolean)
- recommendedNextChecks[]

## Runtime Behavior
- Correlate continuity signals without inventing state.
- Produce replay-safe investigation guidance.
- Preserve escalation reasoning lineage.
## Deterministic Incident Analysis
Classification uses rule-backed evidence mapping and timestamped lineage.

## Output Contract
Every incident output must include:
- lineage
- evidence
- timestamps
- insufficientEvidence flag

## Boundaries
No fabricated incidents, no hidden inference leaps.

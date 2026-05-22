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

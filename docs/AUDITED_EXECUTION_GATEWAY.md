# Audited Execution Gateway

## Philosophy
Operational mutations pass through a single API execution boundary that requires immutable human approval and deterministic dry-run lineage before execution is requested.

## Execution Boundary
The gateway validates:
- approval existence
- approval completeness
- dry-run artifact and timestamp
- deterministic evidence set
- lineage completeness
- deterministic state-machine transition validity

Direct execution without an approval record is rejected with deterministic JSON error responses.

## State Machine
`staged -> approved -> dry_run_validated -> execution_requested -> executed`

Failure edges may transition to `rejected` or `blocked` from allowed pre-terminal states. Terminal states are immutable and cannot transition further.

## Append-only Execution History
Every execution attempt appends immutable history with:
- execution_id
- approval_id
- execution_timestamp
- execution_result
- operator_id
- deterministic_evidence_snapshot
- lineage_snapshot

No overwrite path exists.

## Human Supervision
The gateway explicitly prohibits autonomous execution:
- no auto-execute replay
- no auto-heal incidents
- no auto-run migrations
- no self-escalation
- no self-modification of operational state

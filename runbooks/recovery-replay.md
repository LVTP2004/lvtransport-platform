# LVTransport Recovery Replay Runbook

## Purpose
Perform auditable, controlled replay/recovery steps without hidden or autonomous destructive behavior.

## Mandatory Policy: Dry-Run First
- Every replay sequence must start with a dry-run preview.
- Dry-run output must be reviewed by a human operator before execution.

## Execute + Reason Requirements
Before any non-dry-run replay:
- Record **why** replay is required.
- Record replay scope (records/time window/components).
- Record expected result and rollback strategy.

## Replay Audit Expectations
For each replay action, store:
- command executed,
- operator identity,
- timestamp (UTC),
- target scope,
- dry-run evidence,
- outcome summary.

## Idempotency Expectations
- Replay commands must be idempotent wherever possible.
- If not idempotent, document risks and run once with explicit peer confirmation.
- Never rerun uncertain replay steps without reviewing prior outcomes.

## Operator Approval Expectations
- Human approval is required between dry-run and execute phases.
- Approval record must include approver identity and rationale.

## Forbidden Replay Behavior
- No silent replay execution by AI or automation.
- No destructive replay without explicit human checkpoint.
- No replay against unknown schema versions.
- No replay if integrity checks are failing.

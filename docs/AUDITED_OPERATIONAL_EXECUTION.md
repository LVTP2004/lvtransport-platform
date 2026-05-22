# Audited Operational Execution

This document defines the API-first audited execution controls for high-risk operational actions.

## Endpoints

- `POST /operations/execution/replay`
- `POST /operations/execution/notification-retry`
- `GET /operations/execution/history`

## Required execution controls

Each execution request is deterministically validated before any execution result can be accepted:

1. Immutable approval record (`approvalId`) and `approvalReason` are required.
2. Dry-run lineage reference (`dryRunId`) is required.
3. Lineage snapshot must be complete (`rootOperationId`, `parentDryRunId`, non-empty chain).
4. Deterministic evidence set must be present and non-empty.
5. Transition must be explicitly marked `allowed` and match a known valid transition.

If any control fails, the request is rejected with deterministic rejection reasons.

## Append-only audit history

Every request writes a new immutable audit entry containing:

- execution request payload
- execution result
- operator_id
- timestamp
- lineage snapshot
- dry-run reference
- approval reference

History is retrieved through `GET /operations/execution/history` and is append-only.

## Human supervision guarantees

The API never auto-executes or loops retries. Execution requires explicit human-originated approval and reason on each request.

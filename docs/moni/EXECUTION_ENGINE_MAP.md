# EXECUTION ENGINE MAP

Status: PARTIAL
Mode: Supervised execution only

## Canonical Sources

- apps/api/src/modules/operations-execution
- apps/api/src/modules/execution-governance
- apps/api/src/routes/v1/operations-execution.routes.ts
- moni-core/actions/moni-action-registry.json
- moni-core/approvals/pending-action.md

## Governance

- No execution without Founder approval.
- Execute only registered actions.
- Verify after execution.
- Journal after execution.

## Current Status

Execution layer exists.
Founder approval gate exists.
Production executor is not yet consolidated.

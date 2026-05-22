# Immutable Operator Approvals

## Required Fields
Each operator approval record persists:
- approval_id
- action_type
- target_entity_type
- target_entity_id
- operator_id
- approval_reason
- approval_timestamp
- dry_run_reference
- correlation_id/request_id (when available)
- source lineage references
- execution_status

## Lifecycle
1. `staged`: action intent drafted
2. `approved`: human operator approved with explicit reason
3. `dry_run_validated`: deterministic dry-run evidence and lineage validated
4. `execution_requested`: explicit execution request received
5. terminal: `executed`, `rejected`, or `blocked`

Terminal states are immutable.

## Guarantees
- Approvals are immutable records used as execution prerequisites.
- Execution requires explicit human reason and dry-run lineage.
- Validation and errors are deterministic and JSON-only.
- No autonomous pathway can bypass operator approval.

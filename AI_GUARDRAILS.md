# AI Guardrails — LVTransport Operations

## Allowed AI Assistance
AI may assist with:
- inspection,
- log and state analysis,
- drafting operator checklists,
- identifying likely causes and safe next steps.

## Forbidden AI Behavior
AI may **not**:
- silently mutate operational state,
- execute destructive recovery automatically,
- bypass human approvals,
- fabricate operational health or telemetry,
- trigger hidden migrations/replays/restores.

## Human Approval Boundaries
Human operator approval is required before:
- recovery replay execute phase,
- backup restore to active environment,
- schema migration execution,
- any destructive or irreversible operation.

## Audit Requirement
AI-assisted guidance must remain auditable:
- record suggested command,
- record who approved,
- record who executed,
- record outcome.

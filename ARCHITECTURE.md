# LVTransport Architecture Guardrails (Operational)

This repository's operational architecture remains intentionally conservative.

## Core Operating Model
- Local-first operational persistence.
- SQLite-centric recovery and integrity controls.
- Human-supervised execution gates for sensitive operations.
- Audit trail requirements across startup, backup, recovery, and migrations.

## Anti-Drift Constraints
Do not introduce operational narratives or behavior that imply:
- fake realtime guarantees,
- fake analytics certainty,
- autonomous destructive control loops,
- unnecessary distributed complexity.

## Governance Linkage
Operational runbooks under `/runbooks` define expected real-world execution behavior.
They are binding references for operator onboarding and incident/recovery workflows.

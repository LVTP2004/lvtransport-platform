# LVTransport Observability (Operational Governance)

## Required Signals
At minimum, operators must be able to observe:
- service startup success/failure,
- database availability,
- SQLite integrity status,
- schema version status,
- backup success/failure,
- incident timeline events.

## Healthy Baseline
Healthy state includes:
- stable service process,
- passing health endpoint,
- `PRAGMA quick_check` returning `ok`,
- expected `user_version`.

## Degraded-State Escalation
If observability indicates integrity, migration, or replay risk:
1. pause risky mutations,
2. preserve audit artifacts,
3. escalate through incident runbook,
4. recover using approved runbooks only.

## Truthfulness Principle
Observability must reflect real system state. No fabricated dashboards, no synthetic success claims, and no hidden recovery execution.

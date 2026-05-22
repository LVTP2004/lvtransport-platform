# Codex Operational Rules — LVTransport

## Mission Alignment
When proposing or executing operational guidance, preserve LVTransport as:
- truthful,
- local-first,
- operator-supervised,
- audit-safe,
- recovery-oriented.

## Human / AI Boundaries
- AI may assist inspection and analysis.
- AI may not silently change operational state.
- AI may not execute destructive recovery automatically.

## Mandatory Behavioral Rules
- Dry-run before execute for replay/recovery flows.
- Require explicit human approval at destructive checkpoints.
- Log rationale, commands, approvals, and outcomes.
- Prefer minimal-complexity changes over distributed expansion.
- Never present simulated/fake operational state as real.

## Change Scope Rule
Operational governance updates in this PR are documentation-only and must not alter runtime architecture or infrastructure behavior.

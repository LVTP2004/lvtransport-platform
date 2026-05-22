# Runtime Verification

## Scope
Local-first runtime hardening for `@lvtransport/api` with deterministic startup verification.

## Checks
`pnpm --filter @lvtransport/api runtime:verify` validates:
- SQLite file presence + signature integrity.
- SQLite WAL artifact presence.
- Migration artifact consistency.
- Backup snapshot availability/integrity.
- Expected schema version guard (`RUNTIME_EXPECTED_SCHEMA_VERSION`).
- Execution ledger consistency (`LVTP_EXECUTION_LEDGER_PATH`).

## Deterministic corruption escalation
Corruption-critical failures (`sqlite.*`, `execution-ledger.*`) escalate deterministically with:
- `status=blocked`
- `deterministicCorruptionEscalation.escalated=true`
- explicit failed check IDs in `reasons`.

## Runtime health reports
Each run emits `runtimeHealthReport`:
- total checks
- failed checks
- warning checks
- `localFirstArchitecture=true`

No cloud/distributed dependencies are introduced.

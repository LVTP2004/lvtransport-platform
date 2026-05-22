# Restore Validation

## Scope
Deterministic restore safety validation for local-first operations.

## Commands
- `pnpm --filter @lvtransport/api backup:verify`
- `pnpm --filter @lvtransport/api restore:validate`

## Restore validation guarantees
`restore:validate` performs:
- backup verification (`lvtp-verify-backup.sh`)
- restore dry-run (`lvtp-restore-check.sh`)
- corruption signature detection against runtime SQLite header
- restore lineage validation from `manifest.txt` marker

If any mandatory validation fails, command exits with blocked status.

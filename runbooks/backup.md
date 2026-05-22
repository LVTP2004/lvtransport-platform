# LVTransport Backup Runbook

## Purpose
Define consistent backup expectations for a local-first, audit-safe LVTransport deployment.

## Backup Cadence
- **Minimum**: daily full SQLite backup.
- **Recommended**: every 6 hours during active operations.
- **Before change windows**: mandatory pre-change backup before migrations or recovery replay.

## Local Backup Expectations
- Backups must be created on the same host first (local-first baseline).
- Backup file names must include UTC timestamp and environment identifier.
- Each backup operation must produce:
  - backup artifact,
  - checksum,
  - operator log entry with command + result.

## Retention Guidance
- Keep at least 14 daily backups.
- Keep 4 weekly backups.
- Protect at least one immutable monthly snapshot if storage policy allows.
- Never delete the most recent known-good backup.

## Restore Validation Expectations
Every backup schedule must include restore validation:
1. Restore to an isolated path/environment.
2. Run SQLite `PRAGMA integrity_check;`.
3. Verify expected table set and schema version.
4. Log pass/fail with timestamp and operator identity.

## Operational Safety Notes
- Never overwrite the active production DB file directly during validation.
- Never treat backup creation as successful without checksum and readable artifact verification.
- Do not run destructive cleanup of old backups before confirming newest backup health.
- If backup verification fails, open incident and move system to guarded-change mode.

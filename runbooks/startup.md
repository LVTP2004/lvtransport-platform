# LVTransport Startup Runbook

## Purpose
Boot LVTransport in a predictable, operator-supervised way and verify that persistence and integrity controls are healthy before accepting operational traffic.

## Preconditions
- Operator has shell access to the host.
- `.env` is present and validated.
- SQLite database path is known (default from API env).
- Required process manager (systemd/pm2/manual node) is available.

## Boot Procedure
1. Pull and verify target revision.
2. Install dependencies if needed (`pnpm install --frozen-lockfile`).
3. Start API and required web surface(s) using the approved process command.
4. Confirm process is listening on expected port(s).

## Verify SQLite Initialization
1. Locate the database file path from runtime configuration.
2. Verify file exists and is readable by service user.
3. Run:
   ```bash
   sqlite3 /path/to/lvtransport.db ".tables"
   ```
4. Expect non-empty table list aligned with application modules.

## Verify WAL Mode
1. Run:
   ```bash
   sqlite3 /path/to/lvtransport.db "PRAGMA journal_mode;"
   ```
2. Expected result: `wal`.
3. If result is not `wal`, do **not** continue to production operations. Open an incident and correct startup configuration first.

## Verify Migrations
1. Run:
   ```bash
   sqlite3 /path/to/lvtransport.db "PRAGMA user_version;"
   ```
   (or project migration status command if defined in the release notes).
2. Compare the observed schema version with the release target.
3. If migration mismatch exists, stop rollout and follow `runbooks/migration-rollout.md`.

## Verify Integrity Tooling
1. Execute integrity check command:
   ```bash
   sqlite3 /path/to/lvtransport.db "PRAGMA quick_check;"
   ```
2. Run backup verification command if backup artifacts are expected at startup window.
3. Record outputs in operations log.

## Expected Healthy Startup Signals
- API process is up with stable logs (no crash loop).
- Health endpoint returns success.
- SQLite opens successfully.
- `journal_mode` is `wal`.
- Schema version matches intended release.
- `quick_check` returns `ok`.
- No critical errors in startup log window.

## Escalation Triggers
Escalate immediately if any of the following occur:
- SQLite file missing or unreadable.
- WAL mode disabled.
- Migration drift.
- Integrity check failure.
- Service starts but health endpoint fails.

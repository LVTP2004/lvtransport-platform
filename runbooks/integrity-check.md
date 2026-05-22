# LVTransport Integrity Check Runbook

## Purpose
Continuously validate SQLite health and detect corruption early.

## How to Run Integrity Checks
### Quick check (routine)
```bash
sqlite3 /path/to/lvtransport.db "PRAGMA quick_check;"
```

### Full check (scheduled + after incidents)
```bash
sqlite3 /path/to/lvtransport.db "PRAGMA integrity_check;"
```

### Schema version check
```bash
sqlite3 /path/to/lvtransport.db "PRAGMA user_version;"
```

## Expected Outputs
- Healthy quick check: `ok`
- Healthy integrity check: `ok`
- Schema version: integer matching current rollout target

## Degraded-State Handling
If output is not `ok` or DB access errors appear:
1. Freeze non-essential mutations.
2. Capture database file metadata and recent logs.
3. Run a second integrity check to rule out transient operator error.
4. Trigger incident workflow (`runbooks/incident-response.md`).

## Corruption Escalation Process
1. Declare severity (SEV-1 if active operational data risk).
2. Preserve audit artifacts (logs, command outputs, timestamps).
3. Validate latest known-good backup.
4. Execute controlled restore/recovery only with explicit operator approval.
5. Document root cause and post-incident safeguards.

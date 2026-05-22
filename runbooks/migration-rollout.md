# LVTransport Migration Rollout Runbook

## Purpose
Execute SQLite schema migrations safely with strong operator control and rollback awareness.

## Migration Execution Flow
1. Confirm target release and migration list.
2. Create and verify pre-migration backup.
3. Validate current integrity (`quick_check`/`integrity_check`).
4. Execute migrations in controlled window.
5. Validate schema version and application health.
6. Record results in rollout log.

## `schema_version` Expectations
- Pre-migration and post-migration `PRAGMA user_version;` values must be recorded.
- Post-migration version must exactly match release target.
- Any mismatch is a failed rollout requiring containment.

## Rollback Assumptions
- Rollback is backup-restore based unless migration explicitly provides safe down steps.
- Never assume automatic down-migration safety.
- Rollback decision requires human operator approval and incident ticket linkage.

## Transactional Guarantees
- Prefer transactional migration units.
- If any migration is non-transactional, it must be declared in rollout notes before execution.
- Partial migration outcomes require immediate stop + incident handling.

## Operational Rollout Safety
- No concurrent ad-hoc schema writes during migration window.
- No hidden AI-triggered migration execution.
- Run integrity checks after migrations and before reopening traffic.
- Keep guarded monitoring on for initial post-migration period.

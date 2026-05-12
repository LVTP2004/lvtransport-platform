# LVTP Production Operations Readiness

## Health Checks
- API liveness: `GET /api/v1/health`
- Dispatch diagnostics: `GET /api/v1/dispatch/diagnostics`
- Operations diagnostics: `GET /api/v1/operations/diagnostics`
- Integration readiness: `GET /api/v1/admin/integrations/readiness`

## Backup Readiness (Non-destructive)
1. Snapshot `.data/bookings.json` every 5 minutes to encrypted object storage.
2. Keep 30 days of immutable backups.
3. Validate restore weekly in staging by replacing local `.data/bookings.json`.

## Incident Recovery Checklist
1. Confirm health endpoints are reachable.
2. Inspect `/operations/diagnostics` for stale bookings and incident summary.
3. Run dispatch stale cleanup endpoint if needed.
4. Restore driver assignment state via `/drivers/:driverId/restore-assignments`.
5. Validate latest booking and driver snapshots over realtime channel.
6. Confirm integration readiness before re-enabling external providers.

## Observability Notes
- Use structured logs and incident codes only (never secrets).
- Keep customer-facing channels free of infra-sensitive details.
- Use idempotency keys for booking creation and assignment operations.


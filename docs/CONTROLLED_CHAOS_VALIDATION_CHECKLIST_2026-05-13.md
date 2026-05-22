# LVTP Controlled Chaos Validation Checklist (Safe for dev/staging)

## Preconditions
1. Use non-production dataset.
2. Start API + web/admin/driver surfaces.
3. Capture correlation IDs in terminal logs.

## Scenario 1: Restart recovery
1. Create booking and progress to `en_route`.
2. Restart API process (`pm2 restart <api>` in staging).
3. Validate booking remains in canonical state via admin API.
4. Resume to `arrived` -> `in_progress` -> `completed`.
5. Confirm all surfaces converge.

## Scenario 2: Websocket interruption recovery
1. Disconnect network for each surface individually for 10-20 seconds.
2. Reconnect and verify latest state snapshot overwrites local stale state.
3. Confirm no duplicate lifecycle transition persisted.

## Scenario 3: Duplicate + invalid action safety
1. Re-send same booking submit with same idempotency key.
2. Attempt invalid reverse transition.
3. Attempt mutation on completed ride.
4. Verify domain responses (`INVALID_TRANSITION`, `TERMINAL_STATE_IMMUTABLE`).

## Scenario 4: Delayed propagation
1. Delay websocket client handling (throttle devtools/network).
2. Confirm eventual snapshot reconciliation to backend state.
3. Verify readiness/diagnostics indicate degraded state when lag exceeds threshold.

## Pass criteria
- Backend remains authoritative.
- No cross-surface lifecycle divergence after reconnect.
- Terminal states remain immutable.
- Diagnostics include booking/correlation identifiers.

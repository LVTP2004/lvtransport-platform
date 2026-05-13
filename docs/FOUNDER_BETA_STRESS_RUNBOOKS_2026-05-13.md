# LVTP Founder Beta Stress Runbooks (2026-05-13)

## A) Active ride reconnect problem
- **Symptoms:** customer/driver/admin UI shows old status, websocket reconnect banner persists.
- **Auto-recovery expected:** backend lifecycle remains canonical; reconnect triggers latest snapshot pull.
- **Founder checks:** `GET /api/v1/admin/bookings`, booking lifecycle timeline, websocket heartbeat logs.
- **Safe manual action:** refresh affected surface and trigger lifecycle read endpoint before any manual transition.
- **Call customer when:** tracking remains stale > 2 minutes after reconnect.

## B) Driver panel desync
- **Symptoms:** driver sees `assigned` while admin sees `en_route`.
- **Recovery:** force driver panel refresh; validate booking lifecycle version monotonicity.
- **Truth check:** admin booking record is source of truth.
- **Manual fallback:** pause new assignments for that driver until driver state re-synced.

## C) Customer tracking stale
- **Symptoms:** map marker frozen, ETA not changing.
- **Auto-resync behavior:** client discards stale local state and rehydrates from backend snapshot.
- **Communication fallback:** Dutch-first message: “Uw ritstatus wordt opnieuw gesynchroniseerd.”

## D) VPS/API restart during operations
- **Expected:** PM2 restart, API health returns healthy, booking state preserved from repository.
- **PM2 checks:** `pm2 status`, `pm2 logs --lines 100`.
- **Health checks:** `/health`, readiness endpoint, booking metrics endpoint.
- **Safe continuation:** continue active rides only after readiness + snapshot consistency confirmed.
- **Stop accepting rides when:** readiness degraded + websocket recovery fails across >=2 surfaces.

## E) Assignment conflict
- **Symptoms:** second assign attempt returns conflict.
- **Safe correction:** keep first valid assignment, reject duplicate with domain code.
- **Incident threshold:** repeated conflicts for same booking after reconnect.

## F) Completed ride mutation attempt
- **Expected rejection:** `TERMINAL_STATE_IMMUTABLE` (409).
- **Meaning:** ride closed; no operational action needed.
- **No-action rule:** never reopen completed ride from UI.

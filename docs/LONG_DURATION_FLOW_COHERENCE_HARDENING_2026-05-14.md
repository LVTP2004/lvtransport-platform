# LVTP Long-Duration Flow Coherence Hardening — 2026-05-14

## Scope
This phase hardens operational reliability for sustained moderate load (not destructive peak testing), with emphasis on lifecycle coherence, realtime synchronization, reconnect recovery, and runtime stability.

## Phase 1 — Failure analysis checklist
- Booking lifecycle transitions: validate only canonical transitions are accepted.
- Realtime propagation: validate events are delivered/replayed in-order.
- Reconnect behavior: validate reconnect retrieves latest server truth.
- Duplicate event handling: validate idempotency keys suppress duplicate mutations.
- Local fallback/cache behavior: validate stale local state never overrides fresher server state.
- API responses: track non-2xx frequency and error code clarity.
- Role consistency: validate customer/admin/driver reflect the same lifecycle state.
- Terminal immutability: validate completed/cancelled rides cannot re-enter active flow.
- Runtime behavior: track memory, CPU, restarts, and long-run drift.

## Risk register
- **CRITICAL**: Lifecycle transition bypass causing illegal state mutation.
- **HIGH**: Reconnect applying stale local state over newer server lifecycle.
- **HIGH**: Duplicate event replay causing version drift across roles.
- **MEDIUM**: Delayed realtime propagation producing temporary UI mismatch.
- **MEDIUM**: Memory/listener accumulation during prolonged websocket usage.
- **LOW**: Elevated tail latency in cooldown if runtime recovers after bursts.

## Phase 2 — Hardening controls
- Centralize lifecycle transitions in backend-only guards.
- Reject invalid and stale transitions using expected version + idempotency keys.
- Treat terminal states (`completed`, `cancelled`, `failed`) as immutable.
- Enforce role-agnostic lifecycle truth from server snapshots.
- Reconcile client fallback caches against latest server timestamps.
- Preserve event ordering and monotonic lifecycle versioning.

## Phase 3 — Endurance simulation runner
Use:

```bash
node scripts/ops/lvtp-phase1-stress-sim.js
```

Optional quick-run scaling:

```bash
LVTP_DURATION_SCALE=0.02 LVTP_TICK_MS=300 node scripts/ops/lvtp-phase1-stress-sim.js
```

The runner now models these cycles:
- A Warm Load: 25 customers
- B Sustained Load: 50 customers
- C Higher Sustained: 75 customers
- D Cooldown: 20 customers
- E Recovery: 3 → 2 → 1 customers

And this behavior mix:
- 35% booking creation
- 20% tracking lookup/refresh
- 15% price calculation
- 10% reconnect diagnostics
- 10% navigation/session continuity probes
- 5% driver status/tracking updates
- 5% invalid lifecycle attempts

Recorded metrics:
- total requests
- success and non-2xx rate
- average, p95, p99 latency
- booking creation success
- duplicate attempts
- lifecycle violations
- reconnect failure signals
- memory/CPU snapshots
- placeholders for PM2/Nginx error evidence

## Phase 4–7 validation protocol
- Run endurance simulation under controlled moderate load.
- Compare lifecycle parity across customer/admin/driver surfaces.
- Verify reconnect correctness during active booking transitions.
- Verify cooldown returns runtime to stable baseline.
- Reject release if lifecycle corruption, uncontrolled memory growth, or persistent 5xx appears.

## Phase 8 reporting template
For each validation run, include:
1. Weaknesses found
2. Fixes implemented
3. Lifecycle hardening outcomes
4. Realtime consistency outcomes
5. Reconnect/recovery outcomes
6. Runtime stability outcomes
7. Endurance simulation results
8. Non-2xx trend
9. Memory/CPU trend
10. Remaining risks
11. Long-duration readiness decision
12. Hardware vs code optimization decision
13. Operational maturity %
14. Founder-operator readiness %
15. Readiness for next semi-hard/hard-core phase

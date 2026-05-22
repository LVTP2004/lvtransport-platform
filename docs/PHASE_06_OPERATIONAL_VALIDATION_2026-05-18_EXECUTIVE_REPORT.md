# LVTRANSPORT Operational Consistency & Real-World Validation (2026-05-18)

## Scope
Validated the currently implemented stack behavior across `apps/web`, `apps/api`, and `apps/admin` with runtime API simulation and restart checks.

## Empirical runtime checks executed
- Created booking via `POST /api/v1/bookings`
- Retrieved persisted booking via `GET /api/v1/admin/bookings`
- Retrieved tracking by reference via `GET /api/v1/tracking/booking/:code`
- Updated lifecycle via `PATCH /api/v1/admin/bookings/:bookingId/lifecycle`
- Restarted API process and re-validated booking/tracking state

## Observed behavior
1. Public booking creation: operational (HTTP 201, booking stored).
2. Booking persistence: persisted in `.data/bookings.json` through file-backed repository.
3. Reference code generation: operational (`LV-<stamp>-<token>` generated server-side).
4. API processing: routing/controller/service chain active for booking + tracking + admin endpoints.
5. Admin synchronization: admin list endpoint reflects persisted records.
6. Tracking updates: initially desynchronized after lifecycle patch.
7. Public tracking retrieval: operational endpoint with fallback to lifecycle state.
8. Status propagation: **fixed** to upsert realtime state after lifecycle update.
9. Runtime refresh consistency: consistent after fix (tracking reflects latest state immediately).
10. Restart persistence behavior: persisted bookings survive API restart (file-backed JSON store).

## Persistence classification
- Booking core flow: **REAL PERSISTENCE** (file-backed durable storage).
- Idempotency + duplicate fingerprint index: **REAL PERSISTENCE** (stored in same JSON file).
- Realtime orchestrator in-memory runtime cache: **MEMORY-ONLY**.
- Web identity + dedupe helpers (`localStorage` / `sessionStorage` in web app): **TEMPORARY PERSISTENCE** (client-side only).
- Payment architecture service in-memory maps/sessions: **MEMORY-ONLY**.

## Safe fix applied
- In booking lifecycle update flow, after repository write, the service now also upserts the updated booking state into realtime orchestrator to prevent stale tracking reads.

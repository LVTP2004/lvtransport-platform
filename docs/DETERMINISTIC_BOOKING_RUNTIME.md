# Deterministic Booking Runtime

## Objective
Guarantee a replay-safe booking lifecycle with immutable references and continuity-aware transitions.

## Deterministic Lifecycle
1. Requested
2. Validated (availability + service constraints)
3. Reserved (immutable booking reference minted)
4. Assigned (driver/vehicle linkage)
5. Confirmed (customer-visible continuity state)
6. Completed / Cancelled (terminal with cause code)

## Runtime Guarantees
- Immutable booking reference ID.
- Monotonic booking timestamps (createdAt, validatedAt, assignedAt, finalizedAt).
- Replay-safe transitions via append-only event log.
- Deterministic availability validation (same inputs => same decision).
- Continuity-aware ETA windows generated from verified state snapshots.

## Exposed Artifacts
- Booking verification payload (state hash, version, verifier).
- Booking timestamps.
- Operational continuity state (healthy/degraded/recovering).
- Booking lineage chain (eventId, parentEventId).

## Rejection Semantics
- Reject non-deterministic mutation requests.
- Reject out-of-order state transitions.
- Reject bookings without lineage link.

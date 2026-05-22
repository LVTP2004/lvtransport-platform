# Controlled Realtime Policy

## Motivation
LVTransport realtime synchronization must preserve deterministic operational truth, prevent uncontrolled fan-out, and keep all lifecycle decisions explainable.

## Description
This policy introduces bounded snapshot refresh and deterministic synchronization windows for platform-level synchronization.

- Snapshot refresh is explicitly bounded by:
  - Time window (`windowMs`)
  - Maximum synchronized bookings (`limit`)
- Deterministic synchronization is executed with explicit `windowStartAt` and `windowEndAt` boundaries.
- Synchronization always returns a stable ordering (`updatedAt`, then `id`) to avoid replay variance.

## Synchronization boundaries
- No unbounded live replay.
- No synthetic telemetry generation.
- No websocket chaos-style fan-out for synchronization snapshots.
- Synchronization scope is booking lineage + lifecycle state already persisted by the orchestrator.

## Deterministic guarantees
- Synchronization windows are validated before execution.
- Snapshot ordering is deterministic.
- Append-only lineage is preserved:
  - Timeline remains append-only.
  - Lifecycle event log remains append-only.
- Every synchronization operation writes an audit record with:
  - Type
  - Window bounds
  - Booking count
  - Version vector
  - Lineage-preserved flag

## Audit trail
Use `listSynchronizationAudits()` to review recent synchronization activity and verify boundary compliance.

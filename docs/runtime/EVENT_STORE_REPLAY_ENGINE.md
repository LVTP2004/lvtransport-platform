# LVTP Event Store + Replay Engine

## Goal
Make LVTP operationally auditable, replayable, and investigation-ready.

## Event Store Scope
- booking lifecycle events
- driver lifecycle events
- airport runtime events
- founder intelligence snapshots
- dispatch decisions
- incident warnings

## Replay Engine Scope
- reconstruct booking timelines
- replay driver dispatch flow
- replay airport pickup orchestration
- reconstruct operational incidents
- generate founder investigation reports

## Event Contract
Every runtime event must include:
- eventId
- eventType
- aggregateType
- aggregateId
- actor
- payload
- timestamp
- causationId
- correlationId

## Runtime Guarantees
- deterministic replay
- backend-authoritative history
- no synthetic events
- no fake telemetry
- append-only operational memory
- founder-visible audit trail

## Next Implementation
- event store repository
- replay query service
- founder replay endpoint
- Redis persistence bridge
- operational incident timeline

# Redis Runtime Persistence

## Goal
Persist LVTP operational runtime state outside process memory.

## Scope
- founder intelligence snapshots
- airport runtime cache
- replay preparation
- incident continuity
- PM2 restart survival

## Runtime Rules
- backend-backed only
- no fake telemetry
- no synthetic realtime
- deterministic state recovery

## Next Implementation
- add Redis client abstraction
- add runtime state repository
- add health check for Redis availability
- fallback to memory when Redis is unavailable

# Airport Runtime Sync Worker

## Purpose

Adds a backend-only airport runtime synchronization worker.

## Provider priority

1. FlightAware
2. AviationStack
3. Flightradar
4. Airport feed

## Production rules

- No fake telemetry
- No synthetic flight states
- No demo realtime
- Backend-backed only
- Fallback allowed only as explicit degraded runtime state

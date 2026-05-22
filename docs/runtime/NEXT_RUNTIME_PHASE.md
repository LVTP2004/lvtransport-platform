# LVTP Runtime Production Hardening

## Current State
- PM2 runtime stable
- Founder intelligence endpoint operational
- Airport runtime abstraction created
- Scheduler orchestration active
- Backend-only mode enforced
- No synthetic telemetry

## Next Production Priorities

### 1. Redis Persistence Layer
Goal:
- persist runtime state
- cache airport intelligence
- replay founder investigations

### 2. Flight Provider Live Mode
Providers:
- FlightAware
- AviationStack
- Flightradar

Requirements:
- API key vault
- provider failover
- sync scheduler

### 3. Founder Operational Console
Endpoints:
- /api/v1/founder/intelligence
- /api/v1/founder/runtime
- /api/v1/founder/incidents
- /api/v1/founder/replay

### 4. Operational Replay Engine
Features:
- timeline persistence
- incident reconstruction
- runtime snapshots
- deterministic replay

### 5. Driver Runtime Layer
Features:
- websocket dispatch
- live trip lifecycle
- airport pickup orchestration
- realtime driver telemetry

## Production Constraints
- no fake telemetry
- no synthetic runtime
- no mock airport states
- backend-backed only
- deterministic operations only


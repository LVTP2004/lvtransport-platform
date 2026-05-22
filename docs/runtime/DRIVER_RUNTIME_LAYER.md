# Driver Runtime Layer

## Goal
Transform LVTP into a live operational mobility runtime.

## Runtime Scope

### Driver Dispatch
- websocket dispatch
- realtime assignment
- trip acceptance flow
- trip cancellation flow

### Driver Lifecycle
States:
- offline
- online
- assigned
- enroute_pickup
- waiting
- onboard
- completed

### Airport Runtime
- airport pickup orchestration
- terminal synchronization
- delay-aware dispatch
- pickup buffer automation

### Founder Visibility
- live driver map
- operational replay
- dispatch continuity
- incident reconstruction

## Runtime Rules
- backend-backed only
- deterministic state transitions
- no synthetic telemetry
- replay-safe operations only

## Next Runtime Components
- websocket gateway
- dispatch state machine
- runtime event bus
- trip replay persistence
- Redis-backed mobility memory

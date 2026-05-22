# LVTP Live Dispatch Core

## Objective
Transform LVTP into a realtime dispatch operating system.

## Core Runtime Flow
1. booking created
2. event published
3. Redis propagation
4. websocket dispatch
5. driver receives trip
6. founder runtime updated
7. replay event persisted

## Runtime Sources
- Redis pub/sub
- websocket gateway
- airport runtime
- driver telemetry
- founder governance runtime

## Live Operational Surfaces
- Client realtime booking lifecycle
- Driver realtime dispatch cockpit
- Admin realtime operations map
- Founder realtime governance OS

## Runtime Rules
- backend authoritative
- deterministic dispatch
- replay-safe events
- no fake telemetry
- no synthetic runtime
- operational continuity protected

## Next Runtime Layers
- websocket gateway implementation
- redis event propagation
- driver state machine
- founder incident stream
- live airport synchronization
- operational replay investigations

# LVTP WebSocket Live Runtime

## Goal
Make LVTP operate as a live transport OS.

## Live Channels
- bookings.created
- bookings.updated
- drivers.location.updated
- drivers.status.updated
- dispatch.assigned
- airport.runtime.updated
- founder.runtime.updated
- incident.created

## Runtime Surfaces
- Client: live booking state
- Driver: live dispatch and route state
- Admin: live fleet and operations feed
- Founder: live operational intelligence

## Requirements
- Redis-backed pub/sub
- backend-authoritative events
- replay-safe payloads
- deterministic dispatch
- no fake telemetry
- no synthetic runtime state

## Next Implementation
- websocket gateway
- Redis bridge
- booking event publisher
- driver event publisher
- founder live stream

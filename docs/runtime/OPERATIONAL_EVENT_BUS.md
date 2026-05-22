# LVTP Operational Event Bus

## Goal
Create the deterministic runtime event backbone for LVTP.

## Core Principle
Everything operational becomes an event.

## Event Categories

### Booking Events
- booking_created
- booking_updated
- booking_assigned
- booking_cancelled

### Driver Events
- driver_online
- driver_offline
- driver_location_updated
- trip_started
- trip_completed

### Airport Events
- airport_delay_detected
- terminal_changed
- flight_arrived
- pickup_window_updated

### Founder Events
- runtime_alert
- operational_incident
- replay_snapshot
- continuity_warning

## Runtime Architecture

Client Actions
    ↓
API Layer
    ↓
Operational Event Bus
    ↓
Runtime Persistence
    ↓
Replay Engine
    ↓
Founder Intelligence

## Runtime Guarantees
- deterministic propagation
- replay-safe events
- backend-authoritative state
- event persistence ready
- websocket compatible

## Future Runtime Integrations
- Redis pub/sub
- websocket gateway
- operational replay
- founder investigations
- realtime dispatch
- airport orchestration

## Runtime Rules
- no fake telemetry
- no synthetic events
- no mock dispatch states
- backend-backed only

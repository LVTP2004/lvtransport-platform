# Maps and Telemetry Topology

## Purpose

Define how LVTransport represents space, movement, telemetry, and operational geography across customer, driver, admin, and Founder OS surfaces.

## Map surfaces

1. Customer trip view
2. Driver cockpit map
3. Admin fleet control map
4. Founder replay and intelligence map

## Core map entities

- driver
- vehicle
- booking
- pickup point
- dropoff point
- active trip
- incident zone
- airport zone
- operational zone
- degraded runtime zone

## Driver live positioning

Driver location events must include:

- driverId
- lat
- lng
- heading
- speed
- accuracy
- timestamp
- activeBookingId

## Trip path model

A trip path contains:

- bookingId
- driverId
- pickup
- dropoff
- currentLocation
- estimatedRoute
- actualRoute
- status
- updatedAt

## Map layers

### Customer layer

Shows:

- assigned driver
- vehicle movement
- ETA
- pickup point
- dropoff point
- trip status

### Driver layer

Shows:

- current position
- next pickup
- dropoff
- route
- operational alerts

### Admin layer

Shows:

- all active drivers
- active bookings
- incidents
- airport zones
- degraded areas
- fleet density

### Founder layer

Shows:

- replay movement
- incident geography
- operational heatmaps
- demand zones
- dispatch efficiency
- revenue density

## Telemetry overlays

Supported overlays:

- driver density
- active bookings
- incident severity
- failed payments
- runtime degradation
- dispatch latency
- airport demand
- recovery events

## Realtime behavior

Maps must support:

- WebSocket updates when available
- polling fallback
- last known position
- stale data warning
- replay mode

## Staleness rules

Fresh:

- updated within 10 seconds

Delayed:

- updated within 60 seconds

Stale:

- older than 60 seconds

Unknown:

- no timestamp available

## Replay mode

Replay mode reconstructs:

- driver movement
- booking lifecycle
- incident timeline
- recovery events
- dispatch decisions

Replay must be append-only and auditable.

## Governance rules

- Map data must come from runtime contracts.
- No frontend map may invent driver or trip state.
- All live map data must include timestamps.
- Stale location must be visibly marked.
- Founder replay must preserve historical truth.

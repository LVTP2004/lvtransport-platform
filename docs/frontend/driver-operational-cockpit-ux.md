# Driver Operational Cockpit UX

## Purpose

Define how drivers interact with the LVTransport operational runtime during live operations.

The driver cockpit is a realtime operational interface.

It must minimize cognitive load and maximize execution clarity.

## Driver mission

The driver must always know:

- what to do now
- where to go
- who to pick up
- trip status
- runtime state
- incident state
- connectivity state

## Operational principles

Driver UX must be:

- fast
- calm
- high contrast
- low distraction
- realtime-aware
- offline-tolerant

## Primary sections

1. Active Trip
2. Navigation
3. Booking Queue
4. Driver Status
5. Incident Actions
6. Connectivity State
7. Notifications
8. Shift Status

## Active Trip View

Must show:

- customer name
- pickup
- dropoff
- ETA
- trip status
- navigation state
- runtime health
- payment state

## Trip lifecycle

requested
assigned
accepted
en_route_pickup
arrived_pickup
trip_started
trip_in_progress
arrived_destination
completed
cancelled

## Driver statuses

offline
available
assigned
en_route
on_trip
paused
incident

## Navigation UX

Navigation is primary.

The UI must prioritize:

- next maneuver
- ETA
- pickup distance
- destination distance
- incident rerouting
- airport routing

Non-essential UI must collapse while navigating.

## Realtime behavior

Driver cockpit supports:

- websocket realtime
- polling fallback
- stale telemetry warnings
- degraded runtime awareness

## Connectivity states

online
polling
degraded
offline

Driver must always see current connectivity state.

## Offline behavior

If runtime connectivity fails:

- preserve active trip state
- preserve last known route
- continue local navigation
- queue telemetry locally
- retry synchronization automatically

## Incident actions

Driver may:

- report issue
- report customer no-show
- request support
- report vehicle issue
- report emergency
- request reassignment

## Notification system

Notifications must support:

- assignment alerts
- trip changes
- incident alerts
- runtime degradation alerts
- airport operational alerts

## Airport operations

Airport mode prioritizes:

- pickup queue
- terminal zones
- live congestion
- staging areas
- rerouting instructions

## Telemetry requirements

Driver telemetry must include:

- driverId
- activeBookingId
- position
- heading
- speed
- timestamp
- connectivity state

## UI degradation rules

If realtime fails:

- switch to polling automatically
- show degraded badge
- preserve trip execution visibility

If runtime fails:

- preserve active trip data
- disable unsafe actions
- keep navigation active

## Governance rules

- Driver cockpit consumes runtime contracts only.
- Driver UI must never invent booking state.
- All realtime state must include timestamps.
- Navigation has highest UI priority.
- Safety and clarity override visual density.

# Realtime Event Topology

## Purpose

Define how LVTransport moves live operational information between runtime, frontend, observability, and Founder OS.

## Principle

Realtime is progressive:

1. REST first
2. polling fallback
3. WebSocket when stable
4. replay stream for audit/history

## Event sources

- customer web
- driver cockpit
- admin tower
- api-runtime
- orchestrator agents
- observability stack
- Founder OS

## Core event flows

### Booking flow

BOOKING_CREATED
→ DRIVER_ASSIGNMENT_REQUESTED
→ DRIVER_ASSIGNED
→ DRIVER_EN_ROUTE
→ DRIVER_ARRIVED
→ TRIP_STARTED
→ TRIP_COMPLETED
→ PAYMENT_CAPTURED

### Driver telemetry flow

DRIVER_LOCATION_UPDATED
→ ADMIN_MAP_UPDATED
→ FOUNDER_METRIC_UPDATED

### Incident flow

RUNTIME_DEGRADED
→ INCIDENT_DETECTED
→ RECOVERY_STARTED
→ RECOVERY_COMPLETED
→ INCIDENT_RESOLVED

### Notification flow

NOTIFICATION_REQUESTED
→ NOTIFICATION_SENT
→ NOTIFICATION_FAILED

## Transport model

### Phase 1

REST + polling.

Used for:

- health
- bookings
- admin dashboard
- founder metrics

### Phase 2

WebSocket.

Used for:

- driver location
- active trip state
- admin live map
- dispatch updates

### Phase 3

Replay stream.

Used for:

- incident lineage
- founder audit
- operational replay
- postmortem timelines

## Frontend polling rules

Customer:
- health every 60s
- booking status every 15s during active booking

Driver:
- assigned booking every 10s
- location push every 5s when active

Admin:
- fleet status every 10s
- incidents every 15s
- runtime health every 30s

Founder OS:
- system summary every 30s
- incident lineage every 60s
- financial metrics every 60s

## WebSocket channels

booking:{bookingId}
driver:{driverId}
admin:fleet
admin:incidents
founder:metrics
founder:replay

## UI degradation rules

If WebSocket fails:
- fallback to polling
- show degraded realtime badge
- never hide operational state

If runtime health fails:
- show runtime degraded
- freeze last known data
- show timestamp of last successful update

If telemetry is unavailable:
- dashboards remain visible
- charts show unavailable state
- Founder OS shows intelligence degraded

## Governance rules

- No frontend module may invent event names.
- All event names must map to Runtime UI Contracts.
- All realtime views must have polling fallback.
- Founder OS must show runtime and telemetry degradation.
- Replay must be append-only.

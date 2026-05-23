# Admin Control Tower UX

## Purpose

Define how LVTransport operators supervise, intervene, and recover live operations.

The Admin Control Tower is not a generic dashboard.

It is the human operational command layer.

## Operator mission

The operator must be able to answer:

- What is happening now?
- Which bookings need attention?
- Which drivers are available?
- Are incidents active?
- Is the runtime healthy?
- Is dispatch delayed?
- What must I do next?

## Primary sections

1. Live Fleet Overview
2. Active Bookings
3. Driver Availability
4. Incident Center
5. Dispatch Control
6. Runtime Health
7. Replay and Audit
8. Notifications Monitor

## Live Fleet Overview

Must show:

- active drivers
- assigned drivers
- idle drivers
- active trips
- stale driver locations
- degraded zones
- airport zones

## Booking Operations

Booking list must include:

- booking id
- customer
- driver
- status
- pickup
- dropoff
- ETA
- payment state
- last update
- incident flag

Booking actions:

- assign driver
- reassign driver
- cancel booking
- mark incident
- open replay
- contact driver
- contact customer

## Driver Operations

Driver list must include:

- driver id
- name
- status
- vehicle
- active booking
- location freshness
- rating
- last update

Driver actions:

- assign
- pause
- flag incident
- request location refresh
- open driver timeline

## Incident Center

Incident list must include:

- severity
- status
- source
- affected service
- affected booking
- affected driver
- started at
- recovery status

Incident actions:

- acknowledge
- escalate
- mark investigating
- mark mitigated
- mark resolved
- open replay
- open runtime logs

## Dispatch Control

Dispatch view must show:

- pending bookings
- available drivers
- distance to pickup
- driver status
- dispatch latency
- assignment confidence

Dispatch override must be explicit and auditable.

## Runtime Health Panel

Must show:

- runtime status
- uptime
- restart count
- health endpoint status
- degraded state
- last successful check
- recovery activity

## Crisis Mode

Crisis mode activates when:

- runtime is down
- payment system unavailable
- multiple critical incidents active
- driver telemetry unavailable
- dispatch latency is critical

Crisis mode UI must:

- reduce visual noise
- prioritize critical actions
- freeze non-essential charts
- expose recovery state
- show operator checklist

## Replay and Audit

Replay must support:

- booking lifecycle
- driver movement
- incident timeline
- dispatch decision
- recovery event

Replay is append-only.

## Governance rules

- Operators must never depend on hidden state.
- Every action must be auditable.
- Every live panel must show last update time.
- Degraded systems must remain visible.
- Admin must never call legacy apps/api.
- Admin must consume runtime contracts only.


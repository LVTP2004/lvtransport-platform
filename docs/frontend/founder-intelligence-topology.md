# Founder Intelligence Topology

## Purpose

Define how Founder OS converts runtime, telemetry, incidents, bookings, and recovery events into executive operational intelligence.

## Founder OS mission

Founder OS answers:

- Is the platform healthy?
- Is the business moving?
- Are customers being served?
- Are drivers operating efficiently?
- Is revenue flowing?
- Are incidents controlled?
- Is recovery working?
- What needs attention now?

## Intelligence layers

### Layer 1 — Runtime Health

Sources:

- /health
- /api/v1/health
- /api/v1/startup-validation
- PM2 status
- uptime
- restart count

Signals:

- healthy
- degraded
- recovering
- down

### Layer 2 — Booking Intelligence

Signals:

- active bookings
- completed bookings today
- cancelled bookings
- failed bookings
- average dispatch time
- average trip duration
- conversion from requested to completed

### Layer 3 — Driver Intelligence

Signals:

- available drivers
- assigned drivers
- active trips
- idle time
- location freshness
- driver incident state

### Layer 4 — Revenue Intelligence

Signals:

- revenue today
- completed paid trips
- failed payments
- average booking value
- payment capture rate

### Layer 5 — Incident Intelligence

Signals:

- open incidents
- critical incidents
- recovery started
- recovery completed
- mean time to recovery
- affected services

### Layer 6 — Replay Intelligence

Purpose:

Reconstruct what happened.

Used for:

- incident timeline
- booking lifecycle review
- dispatch replay
- recovery audit
- founder postmortem

## FounderMetricsContract mapping

Founder OS must aggregate:

- runtimeHealth
- activeBookings
- completedBookingsToday
- revenueToday
- incidentCount
- recoverySuccessRate
- averageDispatchTimeSeconds
- customerSatisfaction

## Operational score

Founder OS may calculate:

Operational Score =
runtime health
+ booking flow
+ driver availability
+ payment success
+ incident severity
+ recovery confidence

Status bands:

- 90-100: excellent
- 75-89: stable
- 50-74: degraded
- 0-49: critical

## UI sections

Founder OS dashboard must include:

1. Executive Overview
2. Runtime Health
3. Booking Flow
4. Revenue Pulse
5. Driver Operations
6. Incident Intelligence
7. Recovery & Replay
8. System Confidence

## Degradation rules

If runtime is unavailable:

- show critical banner
- freeze last known metrics
- show last successful timestamp
- disable misleading live charts

If telemetry is unavailable:

- show intelligence degraded
- keep runtime health visible
- hide confidence score or mark partial

If payments are unavailable:

- revenue metrics show degraded
- booking metrics remain visible

## Governance rules

- Founder OS never calls legacy apps/api.
- Founder OS reads contracts only.
- All metrics must have source traceability.
- All live metrics must have timestamps.
- All intelligence summaries must support replay and audit.

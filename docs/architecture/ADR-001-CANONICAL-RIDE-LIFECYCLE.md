# ADR-001 — Canonical Ride Lifecycle

Status: APPROVED

Date: 2026-05-31

Category: Architecture Decision Record

## Context

LV Transport Platform currently contains multiple ride lifecycle states across booking, dispatch, driver, tracking, Moni and operations.

This creates inconsistent operational truth.

## Decision

The platform shall use one canonical RideStatus contract.

Canonical statuses:

- pending
- assigned
- accepted
- en_route
- arrived
- in_progress
- completed
- cancelled
- failed

Final statuses:

- completed
- cancelled
- failed

Canonical flow:

pending → assigned → accepted → en_route → arrived → in_progress → completed

Failure exits:

cancelled

failed

## Required Output

Create:

packages/shared/src/ride-lifecycle.ts

Containing:

- RideStatus
- FINAL_RIDE_STATUSES
- RIDE_STATUS_TRANSITIONS
- isFinalRideStatus
- canTransitionRideStatus
- normalizeLegacyRideStatus

## Consequences

All modules must import lifecycle definitions from packages/shared.

Local lifecycle definitions are deprecated.

END

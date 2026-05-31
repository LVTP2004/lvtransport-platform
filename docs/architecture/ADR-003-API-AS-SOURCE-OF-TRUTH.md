# ADR-003 — API As Source Of Truth

Status: APPROVED

Date: 2026-05-31

Category: Architecture Decision Record

## Context

Some frontend flows currently contain operational behavior through localStorage or local runtime state.

This creates more than one operational truth.

## Decision

The API is the sole source of truth for operational state.

The API exclusively owns:

- Booking State
- Dispatch State
- Driver State
- Tracking State
- Payment State

Frontend applications never own operational truth.

localStorage may only store:

- UI preferences
- Temporary session data
- Cached presentation state

Never operational records.

## Required API Ownership

Booking:

- POST /bookings
- GET /bookings/:id
- GET /bookings
- PATCH /bookings/:id/status

Tracking:

- GET /tracking/booking/:trackingCode

Dispatch:

- POST /dispatch/assign
- POST /dispatch/driver-decision
- PATCH /dispatch/bookings/:bookingId/status

Driver:

- GET /drivers/:driverId/rides/active
- PATCH /drivers/:driverId/location
- PATCH /drivers/:driverId/availability

## Consequences

Booking, tracking, driver state, reviews and Moni context must be backed by API-verified data.

Operational localStorage flows are deprecated.

END

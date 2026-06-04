# DECISION 0001 — Dependency Compatibility Governance

Status: APPROVED
Created: 2026-06-04T12:59:48+02:00
Authority: Founder OS

## Decision

No autonomous service replacement is allowed without dependency compatibility proof.

## Reason

Forge attempted a booking service repair and introduced incompatibility because publishBookingState was missing from the replacement surface.

## Applies To

- Booking
- Dispatch
- Payments
- Websocket
- Runtime services

## Linked Case

DELTA_CASE_0001_BOOKING_SERVICE_COMPATIBILITY_FAILURE

## Linked Lesson

LESSON_0001_DEPENDENCY_COMPATIBILITY

## Linked Protocols

- DEPENDENCY_COMPATIBILITY_PROTOCOL_V1
- CANONICAL_CONTRACT_FIRST_PROTOCOL_V1
- DELTA_TEAM_PROTOCOL_V1

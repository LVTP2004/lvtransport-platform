# CASE 0001 — Booking Service Compatibility Failure

Status: CLOSED_WITH_LESSON
Created: 2026-06-04T12:36:04+02:00

## Incident

Forge attempted replacement involving bookingService and BookingFlowService.

## Failure

publishBookingState was missing from replacement surface.

## Result

Auditor rejected patch.
Rollback executed.

## Root Cause

Dependency compatibility was not verified before repair.

## Lesson

Structural replacements require dependency compatibility audit.

## Generated Protocol

DEPENDENCY_COMPATIBILITY_PROTOCOL_V1

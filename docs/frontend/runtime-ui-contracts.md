# Runtime UI Contracts

## Purpose

This document defines the bridge between the recovered LVTransport runtime and the external visual product surfaces.

Frontend must consume named contracts.

## Source of truth

- apps/api-runtime
- legacy apps/api is forbidden
- runtime contracts are authoritative

## Product surfaces

1. Customer premium experience
2. Driver operational cockpit
3. Admin operational control tower
4. Founder governance and intelligence OS

## RuntimeHealthContract

GET /health
GET /api/v1/health
GET /api/v1/startup-validation

## BookingStatus

requested
confirmed
assigned
en_route
arrived
in_progress
completed
cancelled
failed

## DriverStatus

offline
available
assigned
en_route
on_trip
paused
incident

## TelemetryEventType

BOOKING_CREATED
DRIVER_ASSIGNED
DRIVER_LOCATION_UPDATED
PAYMENT_CAPTURED
PAYMENT_FAILED
NOTIFICATION_SENT
RUNTIME_DEGRADED
RECOVERY_STARTED
RECOVERY_COMPLETED
INCIDENT_DETECTED

## Founder OS Rules

- Founder OS never calls legacy apps/api
- Every metric maps to runtime contracts
- Runtime degradation must be visible
- Realtime requires polling fallback

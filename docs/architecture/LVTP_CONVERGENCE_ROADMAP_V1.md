# LVTP CONVERGENCE ROADMAP V1

Status: APPROVED

Category: Platform Convergence

## Principle

The platform does not primarily require new modules.

The platform requires convergence.

The objective is to establish a single operational truth across all LV Transport Platform systems.

## Strategic Goal

Standardize and consolidate:

- Lifecycle
- Tracking
- Booking
- Dispatch
- Driver Operations
- Moni Context
- Operational Data Ownership

Every platform component must consume the same contracts and the same source of truth.

## Core Architecture Sequence

1. ADR-001 Canonical Ride Lifecycle
2. ADR-002 Canonical Tracking Code
3. ADR-003 API As Source Of Truth
4. packages/shared
5. DispatchAssignment Contract
6. Driver Lifecycle Migration
7. Booking Migration
8. Tracking Migration
9. Moni Verified Context Migration
10. Legacy Cleanup

## Architectural Reasoning

Booking, Dispatch, Driver and Tracking form the operational spine of LV Transport Platform.

Dispatch must be stabilized before downstream migration because it determines how bookings become actionable driver work.

Without dispatch convergence:

- booking convergence remains incomplete
- driver convergence remains unstable
- tracking convergence becomes inconsistent
- Moni receives conflicting operational context

## Definition Of Completion

Convergence is complete when:

- One RideStatus exists platform-wide
- One TrackingCode exists platform-wide
- One Booking Contract exists platform-wide
- API is the sole operational source of truth
- DispatchAssignment is standardized
- Driver uses canonical lifecycle
- Tracking uses canonical contracts
- Moni uses verified context only
- Legacy implementations are removed

END

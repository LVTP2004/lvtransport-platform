# Operational Event Lineage

## Purpose

Define how LVTransport stores, reconstructs, audits, and replays operational history.

Operational lineage is the memory layer of the platform.

## Core principles

Operational history must be:

- append-only
- timestamped
- auditable
- replayable
- immutable
- reconstructable

## Lineage goals

The system must answer:

- what happened
- when it happened
- why it happened
- who triggered it
- what changed afterward
- whether recovery succeeded

## Event sources

- api-runtime
- driver cockpit
- customer web
- admin tower
- Founder OS
- orchestrator agents
- observability stack
- recovery systems

## Event categories

### Runtime events

Examples:

- RUNTIME_STARTED
- RUNTIME_DEGRADED
- RUNTIME_RECOVERED
- PM2_RESTART
- HEALTHCHECK_FAILED

### Booking events

Examples:

- BOOKING_CREATED
- DRIVER_ASSIGNED
- TRIP_STARTED
- TRIP_COMPLETED
- BOOKING_CANCELLED

### Driver events

Examples:

- DRIVER_ONLINE
- DRIVER_LOCATION_UPDATED
- DRIVER_INCIDENT
- DRIVER_OFFLINE

### Payment events

Examples:

- PAYMENT_AUTHORIZED
- PAYMENT_CAPTURED
- PAYMENT_FAILED
- PAYMENT_REFUNDED

### Incident events

Examples:

- INCIDENT_DETECTED
- INCIDENT_ESCALATED
- INCIDENT_RESOLVED

### Recovery events

Examples:

- RECOVERY_STARTED
- RECOVERY_FAILED
- RECOVERY_COMPLETED
- ROLLBACK_EXECUTED

## Event structure

Every event must contain:

- eventId
- eventType
- source
- entityType
- entityId
- timestamp
- severity
- payload
- correlationId

## Correlation model

Correlation IDs connect:

- booking lifecycle
- driver lifecycle
- payment lifecycle
- incident lifecycle
- recovery lifecycle

## Replay system

Replay reconstructs:

- booking execution
- driver movement
- dispatch decisions
- runtime failures
- recovery actions
- incident escalation

## Replay modes

### Timeline replay

Chronological reconstruction.

### Spatial replay

Map-based replay.

### Operational replay

Operator actions and runtime state.

### Founder replay

Executive-level operational reconstruction.

## Storage principles

Lineage storage must be:

- append-only
- durable
- queryable
- replayable
- immutable

## Audit rules

Every critical action must be auditable:

- dispatch override
- cancellation
- reassignment
- incident escalation
- runtime recovery
- rollback execution

## Recovery lineage

Recovery lineage must include:

- trigger reason
- failing subsystem
- recovery strategy
- actions executed
- validation result
- rollback result
- final runtime state

## Founder intelligence integration

Founder OS uses lineage for:

- operational confidence
- anomaly analysis
- replay investigation
- incident review
- recovery scoring
- audit trails

## Governance rules

- No event mutation after append.
- All events require timestamps.
- All critical actions require lineage entries.
- Replay must preserve historical truth.
- Founder OS consumes lineage read-only.
- Lineage is the operational source of historical truth.

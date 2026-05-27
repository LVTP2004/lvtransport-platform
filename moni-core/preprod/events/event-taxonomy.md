# LVTP Event Taxonomy

Core event streams:

## Booking
- booking.created
- booking.updated
- booking.cancelled

## Dispatch
- dispatch.requested
- dispatch.assigned
- dispatch.failed

## Ride
- ride.started
- ride.completed
- ride.cancelled

## Runtime
- runtime.heartbeat
- runtime.degraded
- runtime.recovered

## Moni Core
- moni.diagnosis.created
- moni.semantic.state
- moni.agent.proposal
- moni.incident.detected

Rule:
All events must be explicit, auditable, and evidence-linked.

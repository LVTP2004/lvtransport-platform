# Driver Runtime Implementation

## Deterministic Assignment Lifecycle
Append-only immutable transitions:
1. `ASSIGNED`
2. `ACKNOWLEDGED`
3. `ARRIVED_PICKUP`
4. `ONBOARD`
5. `ACTIVE_ROUTE`
6. `ARRIVED_DESTINATION`
7. `COMPLETED`
8. optional `ESCALATED`

## Runtime Persistence Contract
Store per transition:
- ride lineage reference
- route lineage reference
- assignment history index
- escalation history index
- operational acknowledgement metadata

## Realtime Boundaries
Synchronization is bounded; reconnect rehydrates last confirmed sequence.

# Customer Runtime Implementation

## Deterministic Booking Runtime
Booking IDs are immutable (UUID/ULID), generated once at creation and used as primary lineage anchors.

### Lifecycle (append-only transitions)
1. `CREATED`
2. `VERIFIED`
3. `ASSIGNED`
4. `PICKUP`
5. `ACTIVE_RIDE`
6. `COMPLETED` or `CANCELLED`

Each transition must persist:
- transition timestamp (UTC ISO-8601)
- actor reference
- continuity reference
- replay reference
- support reference (if escalation/cancellation)

## Deterministic ETA Windows
- ETA represented as bounded window (`eta_min`, `eta_max`) with source timestamp.
- Recomputations are versioned; prior ETA windows remain replayable.

## Customer Exposure Contract
- booking verification state
- booking timestamps and transition history
- continuity reference ID
- replay reference ID
- operational support reference

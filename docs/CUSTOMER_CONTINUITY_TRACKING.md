# Customer Ride Continuity Tracking

## Objective
Deliver bounded realtime tracking that is deterministic, quiet, and continuity-aware.

## Tracking Model
- Deterministic ride lifecycle states: enRouteToPickup, arrived, inRide, nearingDestination, completed.
- Verified driver state required before publishing movement updates.
- Snapshot + delta model with bounded update frequency.

## Constraints
- No fake realtime interpolation beyond bounded tolerance.
- No speculative location extrapolation without evidence flag.
- UI must remain low-noise: priority events only.

## Continuity Indicators
- Sync health (stable/degraded/recovering)
- Last verified location timestamp
- ETA confidence band
- Driver verification state

## Replay Safety
- Timeline stored as append-only events.
- Each customer-visible update references source event IDs.
## Bounded Realtime
- Update cadence is bounded and pressure-safe.
- Reconnect behavior uses deterministic session recovery.
- Tracking stream carries sequence IDs for replay safety.

## Tracking Truth Model
Customer tracking shows only verified states:
- driver accepted
- en route to pickup
- arrived pickup
- ride active
- approaching destination
- trip completed

## Reliability Indicators
Expose synchronization health, last update timestamp, and continuity status.
No fake movement interpolation beyond explicit policy.

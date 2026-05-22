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

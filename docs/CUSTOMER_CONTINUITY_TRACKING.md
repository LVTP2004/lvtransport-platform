# Customer Ride Continuity Tracking

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

# LVTransport Airport Runtime Real

This phase introduces a production-safe airport runtime layer.

Rules:
- No simulated flight data.
- No synthetic realtime telemetry.
- No fake KPIs.
- Runtime fields must be backend-backed.
- Fallback state is explicitly marked as backend fallback.

Fields:
- providerPriority
- status
- delayMin
- terminal
- pickupBufferMin
- synchronizedAt
- notes
- generated LV messages

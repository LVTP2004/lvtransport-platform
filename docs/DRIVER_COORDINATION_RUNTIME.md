# Driver Coordination Runtime

## Deterministic Coordination Flows
Dispatcher instructions are structured events, not free-form chat streams.

### Event Types
- assignment_instruction
- continuity_reassignment
- escalation_instruction
- acknowledgement_required

Each event includes immutable IDs, timestamps, and replay links.

## Anti-Noise Constraints
- No Slack-like flooding.
- Prioritize actionable, stateful messages.

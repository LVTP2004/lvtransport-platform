# Driver Operational Cockpit

## Objective
Provide a deterministic, low-pressure cockpit for assignment and navigation continuity.

## Runtime Capabilities
- Assignment continuity with immutable task references.
- Navigation continuity with bounded realtime route sync.
- Operational coordination panel (dispatch messages + escalation channel).
- Deterministic state synchronization across reconnects.

## Driver UX Constraints
- Low cognitive pressure hierarchy: next action first.
- Minimal interrupts; critical alerts only.
- Replay-safe lifecycle progress markers.

## Required Visible State
- Current assignment lineage reference.
- Active state transition and timestamp.
- Sync continuity state.

# LVTransport Operator Collaboration Model

## Motivation
LVTransport operators require a deterministic collaboration surface for incident handling without introducing free-form chat behaviors. This model defines structured interaction points that support rapid coordination while preserving governance and traceability.

## Collaboration Surface (Web)
The web operator collaboration UX is composed of four coordinated views:

1. **Operator coordination views**
   - Incident cards expose deterministic state (severity, status, acknowledgement).
   - Operator selects one incident context at a time.
2. **Incident collaboration timeline**
   - Event stream is append-only.
   - Each event carries actor, action, timestamp, and immutable hash.
3. **Operator assignment lineage**
   - Assignment chain records who assigned whom, role, reason, and timestamp.
   - Lineage supports accountable handoffs.
4. **Acknowledgement flow**
   - Named operator acknowledgement transitions incident ownership from `pending` to `acknowledged`.
   - Acknowledgement writes a new timeline event; prior records are never edited.

## Deterministic Governance
- No chat, assistant, or copilot channel is part of this PR.
- Operator actions must map to constrained transitions.
- Incident state visibility is explicit and reviewable.

## Audit Guarantees
- Timeline and assignment records are immutable from the UI model perspective.
- New facts are represented as appended events.
- Acknowledgement is provenance-linked via actor and timestamp.
- Every surface is designed to support future backend signing/verification without changing user workflows.

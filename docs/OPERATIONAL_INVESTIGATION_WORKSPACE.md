# Operational Investigation Workspace

## Read-only investigation philosophy
The Investigation Workspace is intentionally **read-only**. It renders operational-memory evidence exactly as available and never mutates backend state, never triggers replay execution, and never infers missing facts.

## Evidence navigation model
Operators can inspect evidence through deterministic links on each timeline row:
- source file
- source category
- lineage reference
- correlation_id and request_id (when present)
- deterministically matched runbook reference
- replay/transition references (when present)

The workspace is organized into fixed panels:
1. Timeline
2. Source lineage
3. Replay history
4. Transition history
5. Runbook references
6. Missing data / degraded state

## Filter behavior
Filters are deterministic and conjunctive (AND):
- entity type
- entity id
- correlation_id
- request_id
- category
- timestamp from/to
- source file

When a filter field is empty, it is ignored. Timestamp filters apply only to artifacts that include a parseable timestamp.

## Lineage guarantees
The UI only displays lineage values supplied by operational-memory artifacts. No synthetic lineage graph is generated client-side.

## Missing-data behavior
If no operational-memory artifacts are available, the workspace enters a truthful degraded state and explicitly reports that evidence panels are unavailable.

If artifacts exist but lack specific dimensions (incident id, notification failure id, replay, transition, runbook match), the UI reports those dimensions as absent rather than guessing or projecting values.

## Why chat/copilot is intentionally absent
This release excludes chat/copilot UX by design to preserve operational truth boundaries and avoid speculative outputs during investigations. The workspace remains evidence-first, deterministic, and auditable.

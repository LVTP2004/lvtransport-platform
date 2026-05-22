# Operational Timelines

## Model
Operational timelines are deterministic sequences produced only from the indexed operational memory at `apps/api/data/operational-memory/index/memory-index.json`.

Each timeline entry includes:
- timestamp
- source
- category
- entity type and id when present
- correlation_id when present
- request_id when present
- lineage references (`lineage` + `record:<id>`)
- deterministic short description (`<category>:<message>`)

## Query modes
- entity type + id
- correlation_id
- request_id
- incident-related (`--incident`)
- replay/recovery-related (`--replay`)

## Determinism and sorting
- input records are sorted by timestamp then id.
- timeline output is sorted by timestamp then record id.
- output format is JSON only.

## Source lineage guarantees
Every emitted entry carries lineage references that map to indexed source records. No entry is synthesized outside indexed records.

## Missing-data behavior
If no records match, the engine returns an empty `entries` array in JSON.

## Safety boundary
This layer never mutates operational state, executes replay, or calls external AI/cloud systems.

# Operational Memory Indexing

## Scope
Local-first deterministic indexing for operational cognition only. The indexer ingests repository operational artifacts (docs + API operational modules) and emits a JSON index at `apps/api/.memory/operational-memory-index.json`.

## Indexed operational knowledge
- audit events
- recovery events
- replay history
- incidents
- runbooks
- architecture docs
- AI guardrails
- migration history
- operational state machine docs

## Indexing model
- Source discovery is deterministic and path-scoped.
- Category assignment uses static keyword rules (no probabilistic ML).
- Metadata extraction includes `source`, `timestamp`, `entity_type`, `entity_id`, `correlation_id`, `request_id`, `document_origin`, and `event_lineage_references`.
- Output ordering is stable (sorted by source/id).

## Retrieval guarantees
- Retrieval is read-only and source-linked.
- Results are scored with deterministic lexical matching.
- Every result preserves lineage and origin metadata.

## Hallucination boundaries
- Summaries derive only from indexed records.
- No synthetic operational events are created.
- No inferred state transitions beyond source evidence.

## Operator supervision
- Operators must review source-linked records before actioning findings.
- This layer recommends inspection steps only; it cannot execute operations.

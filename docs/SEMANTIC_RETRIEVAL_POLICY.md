# Semantic Retrieval Policy

## Allowed behaviors
The operational retrieval layer may:
- inspect indexed operational memory
- summarize continuity/replay/incident/migration context
- correlate source-linked records
- explain evidence-backed relationships
- recommend next inspection steps

## Prohibited behaviors
The operational retrieval layer must not:
- mutate operational state
- execute replay
- fabricate operational data
- infer nonexistent transitions
- generate fake analytics
- simulate realtime state

## Source-of-truth rules
- Retrieval and summaries must use indexed operational memory only.
- Every output is JSON and includes lineage references.
- Source metadata is mandatory: source, timestamp, entity fields if available, correlation/request IDs if available, and document origin.

## Deterministic architecture constraints
- Local filesystem index only.
- No vector DB, cloud AI infra, distributed memory, autonomous orchestration, or background AI agents.

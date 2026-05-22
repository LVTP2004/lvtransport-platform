# Operational Evidence Map

## Deterministic relationship model

The web admin operational cognition panels compute evidence relationships with deterministic client-side rules only.

Allowed link sources:
- `correlation_id` exact-match
- `request_id` exact-match
- shared lineage reference tokens
- shared source reference tokens
- explicit entity references
- replay chain links derived from explicit lineage tokens

No probabilistic, semantic, or AI inference is executed.

## Evidence-linking guarantees

Every rendered relationship includes:
- `relationship_type`
- `source evidence`
- `lineage reference` when present
- `correlation_id` and/or `request_id` when present
- deterministic reason string
- timestamp when present

Relationships are rendered only when a deterministic rule passes.

## Lineage visibility rules

Evidence nodes are generated from operational booking payloads (entity + transition nodes).
Lineage/source/entity references are extracted by deterministic parsing of known reference-like fields.

Navigation UX is fixed and read-only:
`timeline → replay → incident → migration → runbook → related entity → source lineage`

## Insufficient-evidence behavior

If no deterministic proof exists:
- no relationship is emitted
- relationship panels show `No proven relationship evidence`
- the correlation graph summary reports insufficient deterministic evidence

This prevents fabricated causality and hidden-topology inference.

## Prohibited behaviors

The operational evidence map must not introduce:
- speculative graph inference
- autonomous recommendations
- backend mutations
- realtime topology streams
- graph databases
- vector/cloud AI correlation engines

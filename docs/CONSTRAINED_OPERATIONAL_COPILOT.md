# Constrained Operational Copilot

## Motivation

LVTransport needs an operational copilot that can help founders/operators interpret runtime evidence without introducing autonomous execution risk. This copilot is intentionally constrained to evidence explanation and operational clarity.

## Description

The Constrained Operational Copilot is an AI-assisted explanation surface in the admin cockpit. It performs deterministic, source-bound retrieval from currently loaded operational sources:

- `admin.bookings`
- `drivers.liveStates`
- `operations.incidents`
- `runtime.sync`

Responses are generated only from this deterministic snapshot and always include:

- source lineage
- evidence references
- deterministic citations

## Copilot boundaries

### Copilot may

- explain
- summarize
- correlate
- recommend inspection steps

### Copilot must not

- mutate state
- execute replay
- invent evidence
- infer hidden operational reality
- auto-escalate
- self-heal

## Safety guarantees

1. **Non-autonomous by design**: no control-plane actions are exposed from the copilot.
2. **Source-bound reasoning**: responses are restricted to deterministic source snapshots.
3. **Deterministic citations**: each response includes citation strings tied to explicit source counters/states.
4. **Insufficient-evidence handling**: empty/ambiguous questions or missing source data return explicit insufficient-evidence responses instead of speculative output.

## Testing

Validate in admin runtime and type checks that:

1. no autonomous execution is performed by the copilot module;
2. responses remain source-linked only (lineage + evidence references + citations);
3. deterministic retrieval path is used for all answer capabilities.

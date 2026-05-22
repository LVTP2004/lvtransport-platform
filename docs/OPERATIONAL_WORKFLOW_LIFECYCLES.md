# Operational Workflow Lifecycles

This document defines the web operational lifecycle workspace model for LVTransport.

## Scope

Web UI read-only operational intelligence for:
- incident lifecycle
- recovery workflow
- escalation workflow
- acknowledgement workflow
- operator handoff

## Workflow Lifecycle Model

Each workflow record includes:
- `type`: one of `incident`, `recovery`, `escalation`, `acknowledgement`, `handoff`
- `state`: deterministic operational state
- `deterministicPath`: fixed state sequence (`detected -> triaged -> stabilizing -> recovering -> validated -> closed`)
- `checkpoints`: explicit completion points with owner and required evidence
- `evidenceRequirements`: mandatory artifacts before closure
- `handoff`: operator handoff record (when applicable)
- `supervision`: always `human_confirmed`

## Deterministic Workflow States

1. `detected`
2. `triaged`
3. `stabilizing`
4. `recovering`
5. `validated`
6. `closed`

Transitions are presented in read-only form and cannot be autonomously executed from the web view.

## Workflow Checkpoints

Checkpoints are structured as:
- checkpoint identifier
- operator owner
- status (`pending` or `complete`)
- required evidence item
- completion timestamp (if complete)

## Operator Handoff Records

Handoff entries must include:
- source operator
- destination operator
- transition reason
- acknowledgement timestamp
- evidence reference

## Human Supervision Guarantees

The workspace is cognition-first and read-only:
- no autonomous execution actions
- no state mutation controls
- no automatic closure actions
- no unsupervised handoff acceptance

All workflow progression remains human-supervised in operations tooling outside this display surface.

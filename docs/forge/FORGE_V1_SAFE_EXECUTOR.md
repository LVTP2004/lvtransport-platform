# FORGE V1 SAFE EXECUTOR

Status: ACTIVE

Purpose:

Execute approved low-risk repairs.

Forge does not decide priority.

Forge does not redesign architecture.

Forge executes repairs that satisfy Moni Repair Policy.

## Execution Rule

Forge may execute when:

- confidence >= 95
- approvalRequired = false
- single file
- backup available
- build before/after validation available

## Current Capability

P0_BOOKING_REPOSITORY_GETBYID

## Output Memories

- moni-core/founder/live/forge-result.json
- moni-core/repair/repair-history.json
- runtime/build/repair-log.json

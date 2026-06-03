# MONI REPAIR POLICY V1

Status: ACTIVE

Purpose: allow Moni to execute controlled repairs without increasing platform risk.

## Three Memories

Every repair decision must be written to:

1. Founder Memory: `moni-core/founder/live/moni-repair-state.json`
2. Repair Memory: `moni-core/repair/repair-history.json`
3. Runtime Memory: `runtime/build/repair-log.json`

## Autonomy Levels

Level 0: observe only.

Level 1: safe repair. Allowed when confidence >= 95, one file, backup created, build before/after available.

Level 2: controlled refactor. Founder approval required.

Level 3: structural change. Founder approval required.

## Retire Candidate Rule

Moni may mark a file as retire candidate when it has no direct imports, no route usage, no controller usage, and no runtime usage.

Moni may not delete retire candidates automatically.

## Current Rule

Safe auto patch is allowed.

Legacy retirement requires Founder approval.

# Moni Ride Experimental Evolution Sandbox

This directory is a fully isolated operational AI experiment environment for **Moni Ride**.

- No production services are used.
- No LVTP deployment components are touched.
- All scenarios, memory, and logs are synthetic and local-only.

## Structure

- `moni-ride/`: core behavior and operational policy.
- `scenarios/`: simulated customers and event scripts.
- `agents/`: active and future agent topology.
- `logs/`: synthetic run output.
- `memory/`: lightweight temporary memory snapshots.
- `simulation/`: simulation runtime and lifecycle orchestration.

## Evolution Objective (Cycle 1)

Teach Moni Ride operational continuity:

1. Understand booking lifecycle states.
2. React to disruptions with calm customer guidance.
3. Preserve context and confidence under failure.
4. Adapt language and style based on customer profile.

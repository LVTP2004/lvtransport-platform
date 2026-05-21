# Operational Console Foundation (Web, Read-only)

## Read-only philosophy
The Operations Console is intentionally read-only. It renders deterministic local artifacts and never performs orchestration actions, data mutation, or autonomous remediation.

## Cognition visibility rules
- Only content from local operational memory artifacts is rendered.
- The console does not infer or invent incident states.
- Missing artifacts produce explicit empty states.

## Source-lineage guarantees
Every timeline and summary block exposes visible lineage metadata:
- source file
- load timestamp
- lineage references when present
- correlation_id when present

## Degraded-state behavior
If any or all operational memory files are absent (`404`/unavailable), the UI reports truthful absence and keeps continuity blocks empty. No synthetic records or placeholder incidents are generated.

## Why realtime is intentionally absent
Realtime streams, polling, websockets, and auto-refresh are excluded to preserve deterministic operational cognition and avoid false movement narratives. Operators inspect a stable snapshot of available continuity artifacts.

#!/usr/bin/env bash
set -euo pipefail

MISSION="${1:-}"
[ -n "$MISSION" ] || { echo "Usage: $0 <mission-file>"; exit 1; }
[ -f "$MISSION" ] || { echo "Mission not found: $MISSION"; exit 1; }

BASE="runtime/convergence/lvtp-execution-chain"
NAME="$(basename "$MISSION" .md)"
NOW="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
OUT="$BASE/outbox/${NAME}_ROUTED.md"

mkdir -p "$BASE/outbox"

cat > "$OUT" <<MD
# ${NAME}_ROUTED

Generated: $NOW

## Chain

Founder
↓
Founder OS
↓
Atlas
↓
Oracle
↓
Leonidas
↓
Nexus
↓
Auditor
↓
Forge

## Source Mission

$MISSION

## Atlas

Status: RECEIVED

Task:
Understand mission and collect evidence.

## Oracle

Status: ACTIVATED

Task:
Prioritize mission.

## Leonidas

Status: ACTIVATED

Task:
Coordinate next operational action.

## Nexus

Status: ACTIVATED

Task:
Generate proposal/specification/patch candidate only after root cause is confirmed.

## Auditor

Status: WAITING

Task:
Validate Nexus output.

## Forge

Status: BLOCKED

Reason:
Awaiting Auditor validation and Founder approval.

## Mission Content

\`\`\`
$(cat "$MISSION")
\`\`\`
MD

echo "$OUT"

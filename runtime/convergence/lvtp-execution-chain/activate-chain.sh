#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
BASE="runtime/convergence/lvtp-execution-chain"
INBOX="runtime/convergence/atlas-code-delivery/inbox"
NOW="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

mkdir -p "$BASE/state" "$BASE/reports" "$BASE/queue" "$BASE/outbox" "$INBOX"

cat > "$BASE/state/LVTP_EXECUTION_CHAIN_V1.json" <<JSON
{
  "status": "ACTIVE",
  "createdAt": "$NOW",
  "law": "Founder decides. Founder OS governs. Atlas understands. Oracle prioritizes. Leonidas directs. Nexus builds. Auditor validates. Forge executes.",
  "chain": [
    "Founder",
    "Founder OS",
    "Atlas",
    "Oracle",
    "Leonidas",
    "Nexus",
    "Auditor",
    "Forge",
    "Knowledge Gateway",
    "Bloodstream",
    "GitHub",
    "Nodes"
  ],
  "mode": "activation_not_creation",
  "execution": "blocked_until_auditor_validation"
}
JSON

cat > "$BASE/reports/LVTP_EXECUTION_CHAIN_V1.md" <<'MD'
# LVTP EXECUTION CHAIN V1

Status: ACTIVE

## Law

Founder decides.  
Founder OS governs.  
Atlas understands.  
Oracle prioritizes.  
Leonidas directs.  
Nexus builds.  
Auditor validates.  
Forge executes.  
Knowledge Gateway preserves truth.  
Bloodstream distributes truth.  
GitHub transports.  
Nodes execute reality.

## Purpose

Activate the existing command chain without creating duplicate systems.

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
↓  
Knowledge Gateway  
↓  
Bloodstream  
↓  
GitHub  
↓  
Nodes

## Rule

No mission reaches Forge until Auditor validates.
MD

cat > "$BASE/reports/ORACLE_ACTIVATION_V1.md" <<'MD'
# ORACLE ACTIVATION V1

Status: ACTIVE

Purpose:
Prioritization, opportunity analysis, capacity analysis, timing analysis.

Input:
Atlas mission classification.

Output:
Priority decision.

Oracle answers:
Should this be done now?
MD

cat > "$BASE/reports/LEONIDAS_ACTIVATION_V1.md" <<'MD'
# LEONIDAS ACTIVATION V1

Status: ACTIVE

Purpose:
Operational direction, coordination, delegation, escalation.

Input:
Atlas evidence + Oracle priority.

Output:
Directed operational path.

Leonidas answers:
Who does what next?
MD

cat > "$BASE/reports/NEXUS_ACTIVATION_V1.md" <<'MD'
# NEXUS ACTIVATION V1

Status: ACTIVE

Purpose:
Artifact generation, specification generation, proposal generation, code generation.

Input:
Leonidas-directed mission.

Output:
Founder/Auditor-ready artifacts.

Nexus answers:
What should be built?
MD

cat > "$BASE/route-mission.sh" <<'EOF2'
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
EOF2

chmod +x "$BASE/route-mission.sh"

if [ -f "$INBOX/MISSION_RESTORE_MONI_CONSOLE.md" ]; then
  "$BASE/route-mission.sh" "$INBOX/MISSION_RESTORE_MONI_CONSOLE.md"
fi

if [ -f "$INBOX/MISSION_LVTP_DUPLICATE_DISCOVERY.md" ]; then
  "$BASE/route-mission.sh" "$INBOX/MISSION_LVTP_DUPLICATE_DISCOVERY.md"
fi

git add "$BASE" "$INBOX" || true
git commit -m "Activate LVTP execution chain v1" || true
git push || true

echo "LVTP EXECUTION CHAIN V1 ACTIVE"
echo "Reports: $BASE/reports"
echo "Outbox:  $BASE/outbox"

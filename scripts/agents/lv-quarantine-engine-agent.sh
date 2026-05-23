#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/lvtransport-platform"
STATE="$ROOT/runtime/governance/quarantine-state.json"
LOG="$ROOT/logs/lv-quarantine-engine-agent.log"

cd "$ROOT"

echo "===== QUARANTINE ENGINE AGENT $(date -u) =====" | tee "$LOG"

bash scripts/agents/lv-runtime-readiness.sh | tee -a "$LOG"

REPLAY="$(curl -fsS http://127.0.0.1:3000/api/v1/replay)"
TELEMETRY="$(curl -fsS http://127.0.0.1:3000/api/v1/telemetry)"

python3 - <<'PY' "$REPLAY" "$TELEMETRY" "$STATE" "$LOG"
import json, sys
from datetime import datetime, timezone

replay = json.loads(sys.argv[1])
telemetry = json.loads(sys.argv[2])
state_path = sys.argv[3]
log_path = sys.argv[4]

runtime = telemetry.get("runtime") or {}
restarts = int(runtime.get("restarts") or 0)
incidents = replay.get("state", {}).get("incidents") or []

quarantine = False
reason = None

if restarts >= 20:
    quarantine = True
    reason = f"restart_count_critical:{restarts}"

critical_incidents = [
    i for i in incidents
    if "CRITICAL" in str(i.get("type", "")) or "FAILED" in str(i.get("type", ""))
]

if critical_incidents:
    quarantine = True
    reason = reason or f"critical_incidents:{len(critical_incidents)}"

state = {
    "quarantined": quarantine,
    "reason": reason,
    "metrics": {
        "restarts": restarts,
        "incidentCount": len(incidents),
        "criticalIncidentCount": len(critical_incidents)
    },
    "updatedAt": datetime.now(timezone.utc).isoformat()
}

open(state_path, "w").write(json.dumps(state, indent=2) + "\n")
open(log_path, "a").write(json.dumps(state) + "\n")
print(json.dumps(state))
PY

if grep -q '"quarantined": true' "$STATE"; then
  curl -fsS -X POST http://127.0.0.1:3000/api/v1/events \
    -H "Content-Type: application/json" \
    -d '{"type":"RUNTIME_QUARANTINED","payload":{"source":"lv-quarantine-engine-agent"}}' | tee -a "$LOG"
else
  curl -fsS -X POST http://127.0.0.1:3000/api/v1/events \
    -H "Content-Type: application/json" \
    -d '{"type":"QUARANTINE_EVALUATED_CLEAR","payload":{"source":"lv-quarantine-engine-agent"}}' | tee -a "$LOG"
fi

echo "" | tee -a "$LOG"

git add runtime/governance/quarantine-state.json scripts/agents/lv-quarantine-engine-agent.sh
git commit -m "runtime(quarantine): add self-protection state engine" || true

pm2 save

echo "===== QUARANTINE ENGINE AGENT DONE =====" | tee -a "$LOG"

#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/lvtransport-platform"
MODE_FILE="$ROOT/runtime/governance/recovery-mode.json"
QUARANTINE_FILE="$ROOT/runtime/governance/quarantine-state.json"
LOG="$ROOT/logs/lv-recovery-mode-agent.log"

cd "$ROOT"

echo "===== RECOVERY MODE AGENT $(date -u) =====" | tee "$LOG"

bash scripts/agents/lv-runtime-readiness.sh | tee -a "$LOG"

TELEMETRY="$(curl -fsS http://127.0.0.1:3000/api/v1/telemetry)"
REPLAY="$(curl -fsS http://127.0.0.1:3000/api/v1/replay)"

python3 - <<'PY' "$TELEMETRY" "$REPLAY" "$QUARANTINE_FILE" "$MODE_FILE" "$LOG"
import json, sys
from datetime import datetime, timezone

telemetry = json.loads(sys.argv[1])
replay = json.loads(sys.argv[2])
quarantine_path = sys.argv[3]
mode_path = sys.argv[4]
log_path = sys.argv[5]

try:
    quarantine = json.loads(open(quarantine_path).read())
except Exception:
    quarantine = {"quarantined": False}

runtime = telemetry.get("runtime") or {}
restarts = int(runtime.get("restarts") or 0)
status = runtime.get("status")
incidents = replay.get("state", {}).get("incidents") or []

mode = "normal"
reason = "runtime_stable"

if quarantine.get("quarantined"):
    mode = "quarantined"
    reason = quarantine.get("reason") or "quarantine_active"
elif status != "online":
    mode = "recovery"
    reason = f"pm2_status:{status}"
elif restarts >= 20:
    mode = "recovery"
    reason = f"restart_critical:{restarts}"
elif restarts >= 10:
    mode = "degraded"
    reason = f"restart_warning:{restarts}"
elif len(incidents) > 0:
    mode = "degraded"
    reason = f"incidents_present:{len(incidents)}"

state = {
    "mode": mode,
    "reason": reason,
    "metrics": {
        "pm2Status": status,
        "restarts": restarts,
        "incidentCount": len(incidents),
        "quarantined": bool(quarantine.get("quarantined"))
    },
    "updatedAt": datetime.now(timezone.utc).isoformat()
}

open(mode_path, "w").write(json.dumps(state, indent=2) + "\n")
open(log_path, "a").write(json.dumps(state) + "\n")
print(json.dumps(state))
PY

MODE="$(python3 -c 'import json;print(json.load(open("runtime/governance/recovery-mode.json"))["mode"])')"

curl -fsS -X POST http://127.0.0.1:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"RECOVERY_MODE_EVALUATED\",\"payload\":{\"mode\":\"$MODE\",\"source\":\"lv-recovery-mode-agent\"}}" \
  | tee -a "$LOG"

echo "" | tee -a "$LOG"

git add runtime/governance/recovery-mode.json scripts/agents/lv-recovery-mode-agent.sh
git commit -m "runtime(recovery): add adaptive recovery mode engine" || true

pm2 save

echo "===== RECOVERY MODE AGENT DONE =====" | tee -a "$LOG"

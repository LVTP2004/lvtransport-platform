#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/lvtransport-platform"
LOG="$ROOT/logs/lv-governance-agent.log"

cd "$ROOT"

echo "===== GOVERNANCE AGENT $(date -u) =====" | tee "$LOG"

bash scripts/agents/lv-runtime-readiness.sh | tee -a "$LOG"

HEALTH="$(curl -fsS http://127.0.0.1:3000/health)"
TELEMETRY="$(curl -fsS http://127.0.0.1:3000/api/v1/telemetry)"
REPLAY="$(curl -fsS http://127.0.0.1:3000/api/v1/replay)"

python3 - <<'PY' "$HEALTH" "$TELEMETRY" "$REPLAY" "$LOG"
import json, sys, subprocess, datetime

health = json.loads(sys.argv[1])
telemetry = json.loads(sys.argv[2])
replay = json.loads(sys.argv[3])
log = sys.argv[4]

runtime = telemetry.get("runtime") or {}
restarts = int(runtime.get("restarts") or 0)
status = runtime.get("status")
event_count = int(replay.get("state", {}).get("eventCount") or 0)
incidents = replay.get("state", {}).get("incidents") or []

severity = "normal"
actions = []

if not health.get("ok"):
    severity = "critical"
    actions.append("runtime_health_failed")

if status != "online":
    severity = "critical"
    actions.append("pm2_status_not_online")

if restarts >= 20:
    severity = "critical"
    actions.append("restart_storm_detected")
elif restarts >= 10:
    severity = "warning"
    actions.append("high_restart_count")

if len(incidents) > 0:
    severity = "warning" if severity == "normal" else severity
    actions.append("incidents_present")

decision = {
    "ok": severity != "critical",
    "type": "GOVERNANCE_EVALUATED",
    "severity": severity,
    "actions": actions,
    "metrics": {
        "runtimeStatus": status,
        "restarts": restarts,
        "eventCount": event_count,
        "incidentCount": len(incidents),
    },
    "evaluatedAt": datetime.datetime.utcnow().isoformat() + "Z"
}

with open(log, "a") as f:
    f.write(json.dumps(decision) + "\n")

payload = json.dumps({
    "type": "GOVERNANCE_EVALUATED",
    "payload": decision
})

subprocess.run([
    "curl", "-fsS", "-X", "POST",
    "http://127.0.0.1:3000/api/v1/events",
    "-H", "Content-Type: application/json",
    "-d", payload
], check=True)

if severity == "critical":
    raise SystemExit(1)
PY

echo "" | tee -a "$LOG"
curl -fsS http://127.0.0.1:3000/api/v1/replay | tee -a "$LOG"
echo "" | tee -a "$LOG"

git add scripts/agents/lv-governance-agent.sh
git commit -m "runtime(governance): add automated governance evaluator" || true

pm2 save

echo "===== GOVERNANCE AGENT DONE =====" | tee -a "$LOG"

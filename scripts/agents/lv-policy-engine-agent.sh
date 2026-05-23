#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/lvtransport-platform"
POLICIES="$ROOT/runtime/governance/policies.json"
LOG="$ROOT/logs/lv-policy-engine-agent.log"

cd "$ROOT"

echo "===== POLICY ENGINE AGENT $(date -u) =====" | tee "$LOG"

bash scripts/agents/lv-runtime-readiness.sh | tee -a "$LOG"

TELEMETRY="$(curl -fsS http://127.0.0.1:3000/api/v1/telemetry)"
REPLAY="$(curl -fsS http://127.0.0.1:3000/api/v1/replay)"

python3 - <<'PY' "$POLICIES" "$TELEMETRY" "$REPLAY" "$LOG"
import json, sys, subprocess
from datetime import datetime, timezone

policies = json.loads(open(sys.argv[1]).read()).get("policies", [])
telemetry = json.loads(sys.argv[2])
replay = json.loads(sys.argv[3])
log = sys.argv[4]

values = {
    "runtime.restarts": int((telemetry.get("runtime") or {}).get("restarts") or 0),
    "process.rss": int((telemetry.get("process") or {}).get("memory", {}).get("rss") or 0),
    "replay.incidentCount": len((replay.get("state") or {}).get("incidents") or []),
    "replay.eventCount": int((replay.get("state") or {}).get("eventCount") or 0),
}

def compare(actual, op, expected):
    if op == ">=": return actual >= expected
    if op == ">": return actual > expected
    if op == "<=": return actual <= expected
    if op == "<": return actual < expected
    if op == "==": return actual == expected
    return False

matches = []

for policy in policies:
    metric = policy["metric"]
    actual = values.get(metric)
    if actual is None:
        continue

    if compare(actual, policy["operator"], policy["value"]):
        matches.append({
            "policy": policy["name"],
            "event": policy["event"],
            "severity": policy["severity"],
            "metric": metric,
            "actual": actual,
            "threshold": policy["value"],
            "evaluatedAt": datetime.now(timezone.utc).isoformat()
        })

for match in matches:
    payload = json.dumps({
        "type": match["event"],
        "payload": match
    })

    subprocess.run([
        "curl", "-fsS", "-X", "POST",
        "http://127.0.0.1:3000/api/v1/events",
        "-H", "Content-Type: application/json",
        "-d", payload
    ], check=True)

summary = {
    "ok": True,
    "type": "POLICY_ENGINE_EVALUATED",
    "matches": matches,
    "metrics": values,
    "evaluatedAt": datetime.now(timezone.utc).isoformat()
}

open(log, "a").write(json.dumps(summary) + "\n")
print(json.dumps(summary))
PY

echo "" | tee -a "$LOG"

curl -fsS -X POST http://127.0.0.1:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{"type":"POLICY_ENGINE_EVALUATED","payload":{"source":"lv-policy-engine-agent"}}' \
  | tee -a "$LOG"

echo "" | tee -a "$LOG"

git add runtime/governance/policies.json scripts/agents/lv-policy-engine-agent.sh
git commit -m "runtime(policy): add automated policy engine" || true

pm2 save

echo "===== POLICY ENGINE AGENT DONE =====" | tee -a "$LOG"

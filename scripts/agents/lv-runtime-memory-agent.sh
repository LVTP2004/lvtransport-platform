#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/lvtransport-platform"
MEMORY="$ROOT/runtime/memory"
LOG="$ROOT/logs/lv-runtime-memory-agent.log"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
SNAPSHOT="$MEMORY/snapshot-$STAMP.json"
LATEST="$MEMORY/latest.json"

cd "$ROOT"

echo "===== RUNTIME MEMORY AGENT $STAMP =====" | tee "$LOG"

bash scripts/agents/lv-runtime-readiness.sh | tee -a "$LOG"

HEALTH="$(curl -fsS http://127.0.0.1:3000/health)"
TELEMETRY="$(curl -fsS http://127.0.0.1:3000/api/v1/telemetry)"
REPLAY="$(curl -fsS http://127.0.0.1:3000/api/v1/replay)"
TIMELINE="$(curl -fsS http://127.0.0.1:3000/api/v1/timeline)"
MODE="$(cat runtime/governance/recovery-mode.json 2>/dev/null || echo '{}')"
QUARANTINE="$(cat runtime/governance/quarantine-state.json 2>/dev/null || echo '{}')"
REGISTRY="$(cat runtime/governance/agent-registry.json 2>/dev/null || echo '{}')"

python3 - <<'PY' "$SNAPSHOT" "$LATEST" "$STAMP" "$HEALTH" "$TELEMETRY" "$REPLAY" "$TIMELINE" "$MODE" "$QUARANTINE" "$REGISTRY"
import json, sys
from datetime import datetime, timezone
from pathlib import Path

snapshot_path = Path(sys.argv[1])
latest_path = Path(sys.argv[2])
stamp = sys.argv[3]

payload = {
    "ok": True,
    "type": "RUNTIME_MEMORY_SNAPSHOT",
    "stamp": stamp,
    "capturedAt": datetime.now(timezone.utc).isoformat(),
    "health": json.loads(sys.argv[4]),
    "telemetry": json.loads(sys.argv[5]),
    "replay": json.loads(sys.argv[6]),
    "timeline": json.loads(sys.argv[7]),
    "recoveryMode": json.loads(sys.argv[8]),
    "quarantine": json.loads(sys.argv[9]),
    "agentRegistry": json.loads(sys.argv[10])
}

snapshot_path.write_text(json.dumps(payload, indent=2) + "\n")
latest_path.write_text(json.dumps(payload, indent=2) + "\n")

print(json.dumps({
    "ok": True,
    "snapshot": str(snapshot_path),
    "eventCount": payload["replay"]["state"]["eventCount"],
    "mode": payload["recoveryMode"].get("mode"),
}))
PY

curl -fsS -X POST http://127.0.0.1:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"RUNTIME_MEMORY_SNAPSHOT_CREATED\",\"payload\":{\"stamp\":\"$STAMP\",\"snapshot\":\"$SNAPSHOT\"}}" \
  | tee -a "$LOG"

echo "" | tee -a "$LOG"

git add runtime/memory scripts/agents/lv-runtime-memory-agent.sh
git commit -m "runtime(memory): add operational memory snapshots" || true

pm2 save

echo "===== RUNTIME MEMORY AGENT DONE =====" | tee -a "$LOG"

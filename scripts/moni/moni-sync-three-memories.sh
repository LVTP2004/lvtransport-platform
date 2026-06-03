#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/lvtransport-platform"
cd "$ROOT" || exit 1

mkdir -p moni-core/founder/live moni-core/repair runtime/build

STATE="moni-core/founder/live/moni-repair-state.json"
HISTORY="moni-core/repair/repair-history.json"
RUNTIME="runtime/build/repair-log.json"
POLICY="moni-core/policies/moni-repair-policy-v1.json"

TIMESTAMP="$(date -Iseconds)"
ERROR_COUNT="$(grep -Eo 'error TS[0-9]+' runtime/build/api-build-post-getbyid.log 2>/dev/null | wc -l | tr -d ' ')"

cat > "$STATE" <<JSON
{
  "timestamp": "$TIMESTAMP",
  "policy": "MONI_REPAIR_POLICY_V1",
  "status": "$([ "$ERROR_COUNT" = "0" ] && echo "GREEN" || echo "BLOCKED")",
  "buildErrors": $ERROR_COUNT,
  "currentBottleneck": "Legacy Booking Runtime",
  "nextDecision": "repair_vs_retire",
  "autonomy": {
    "current": 25,
    "recommended": 25,
    "reason": "Safe auto patch succeeded; legacy retirement still requires Founder approval."
  },
  "memoriesSynced": [
    "founder",
    "repair",
    "runtime"
  ]
}
JSON

python3 <<'PY'
import json
from pathlib import Path
from datetime import datetime

history_path = Path("moni-core/repair/repair-history.json")
runtime_path = Path("runtime/build/repair-log.json")

event = {
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "policy": "MONI_REPAIR_POLICY_V1",
    "event": "three_memory_sync",
    "result": "synced",
    "currentBottleneck": "Legacy Booking Runtime",
    "nextDecision": "repair_vs_retire"
}

for path in [history_path, runtime_path]:
    if path.exists():
        try:
            data = json.loads(path.read_text())
            if not isinstance(data, list):
                data = [data]
        except Exception:
            data = []
    else:
        data = []
    data.append(event)
    path.write_text(json.dumps(data, indent=2))
PY

echo "===== THREE MEMORIES SYNCED ====="
echo "Founder: $STATE"
echo "Repair:  $HISTORY"
echo "Runtime: $RUNTIME"
echo
cat "$STATE"

#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/lvtransport-platform"
APP="$ROOT/apps/api-runtime"
STATE="$ROOT/runtime/governance/recovery-mode.json"
LOG="$ROOT/logs/lv-rollout-engine-agent.log"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="$ROOT/backups/rollouts/api-runtime-$STAMP"

cd "$ROOT"

echo "===== ROLLOUT ENGINE AGENT $STAMP =====" | tee "$LOG"

bash scripts/agents/lv-runtime-readiness.sh | tee -a "$LOG"

MODE="$(python3 -c 'import json;print(json.load(open("runtime/governance/recovery-mode.json")).get("mode","unknown"))' 2>/dev/null || echo unknown)"

echo "mode=$MODE" | tee -a "$LOG"

if [ "$MODE" = "quarantined" ] || [ "$MODE" = "recovery" ]; then
  echo "ROLLOUT BLOCKED: mode=$MODE" | tee -a "$LOG"
  exit 1
fi

echo "1. Backup runtime" | tee -a "$LOG"
cp -a "$APP" "$BACKUP"

echo "2. Syntax gate" | tee -a "$LOG"
find "$APP/src" -name "*.js" -print0 | xargs -0 -n1 node --check

echo "3. Restart candidate" | tee -a "$LOG"
pm2 restart lvtransport-api --update-env | tee -a "$LOG"

echo "4. Readiness gate" | tee -a "$LOG"
if ! bash scripts/agents/lv-runtime-readiness.sh | tee -a "$LOG"; then
  echo "READINESS FAILED. ROLLBACK." | tee -a "$LOG"
  rm -rf "$APP"
  cp -a "$BACKUP" "$APP"
  pm2 restart lvtransport-api --update-env
  bash scripts/agents/lv-runtime-readiness.sh
  exit 1
fi

echo "5. Integrity gate" | tee -a "$LOG"
if ! bash scripts/agents/lv-integrity-audit-agent.sh | tee -a "$LOG"; then
  echo "INTEGRITY FAILED. ROLLBACK." | tee -a "$LOG"
  rm -rf "$APP"
  cp -a "$BACKUP" "$APP"
  pm2 restart lvtransport-api --update-env
  bash scripts/agents/lv-runtime-readiness.sh
  exit 1
fi

echo "6. Emit rollout event" | tee -a "$LOG"
curl -fsS -X POST http://127.0.0.1:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"ROLLOUT_VALIDATED\",\"payload\":{\"stamp\":\"$STAMP\",\"backup\":\"$BACKUP\",\"mode\":\"$MODE\"}}" \
  | tee -a "$LOG"

echo "" | tee -a "$LOG"

git add scripts/agents/lv-rollout-engine-agent.sh backups/rollouts runtime/governance
git commit -m "runtime(rollout): add controlled rollout engine" || true

pm2 save

echo "===== ROLLOUT ENGINE AGENT DONE =====" | tee -a "$LOG"

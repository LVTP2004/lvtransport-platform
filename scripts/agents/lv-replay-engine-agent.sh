#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/lvtransport-platform"
APP="$ROOT/apps/api-runtime"
LOG="$ROOT/logs/lv-replay-engine-agent.log"

cd "$ROOT"
echo "===== REPLAY ENGINE AGENT $(date -u) =====" | tee "$LOG"

mkdir -p "$APP/src/modules/replay"

cat > "$APP/src/modules/replay/replay.routes.js" <<'EOF'
import express from "express";
import { listEvents } from "../events/event-store.service.js";

const router = express.Router();

function buildReplayState(events) {
  const state = {
    ok: true,
    eventCount: events.length,
    lastEventAt: null,
    counters: {},
    incidents: [],
    runtime: {
      healthConfirmed: false,
      lastHealth: null
    }
  };

  for (const event of events) {
    state.lastEventAt = event.createdAt;
    state.counters[event.type] = (state.counters[event.type] ?? 0) + 1;

    if (String(event.type).includes("FAILED")) {
      state.incidents.push(event);
    }

    if (event.type === "RUNTIME_HEALTH_CONFIRMED") {
      state.runtime.healthConfirmed = true;
      state.runtime.lastHealth = event.payload?.health ?? null;
    }
  }

  return state;
}

router.get("/", (_req, res) => {
  const events = listEvents()
    .slice()
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));

  res.json({
    ok: true,
    replayedAt: new Date().toISOString(),
    state: buildReplayState(events)
  });
});

export default router;
EOF

python3 - <<'PY'
from pathlib import Path

p = Path("apps/api-runtime/src/server.js")
s = p.read_text()

if 'replay.routes.js' not in s:
    s = s.replace(
        'import timelineRoutes from "./modules/timeline/timeline.routes.js";',
        'import timelineRoutes from "./modules/timeline/timeline.routes.js";\nimport replayRoutes from "./modules/replay/replay.routes.js";'
    )

if 'app.use("/api/v1/replay", replayRoutes);' not in s:
    s = s.replace(
        'app.use("/api/v1/timeline", timelineRoutes);',
        'app.use("/api/v1/timeline", timelineRoutes);\napp.use("/api/v1/replay", replayRoutes);'
    )

p.write_text(s)
print("replay mounted")
PY

find "$APP/src" -name "*.js" -print0 | xargs -0 -n1 node --check

pm2 restart lvtransport-api --update-env
sleep 5

curl -fsS http://127.0.0.1:3000/health | tee -a "$LOG"
echo "" | tee -a "$LOG"

curl -fsS -X POST http://127.0.0.1:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{"type":"REPLAY_ENGINE_INITIALIZED","payload":{"source":"lv-replay-engine-agent"}}' \
  | tee -a "$LOG"

echo "" | tee -a "$LOG"

curl -fsS http://127.0.0.1:3000/api/v1/replay | tee -a "$LOG"
echo "" | tee -a "$LOG"

git add apps/api-runtime scripts/agents/lv-replay-engine-agent.sh
git commit -m "runtime(replay): add operational replay engine" || true

pm2 save

echo "===== REPLAY ENGINE AGENT DONE =====" | tee -a "$LOG"

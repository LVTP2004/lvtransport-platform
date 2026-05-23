#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/lvtransport-platform"
APP="$ROOT/apps/api-runtime"
LOG="$ROOT/logs/lv-incident-timeline-agent.log"

cd "$ROOT"

echo "===== INCIDENT TIMELINE AGENT $(date -u) =====" | tee "$LOG"

cat > "$APP/src/modules/timeline/timeline.routes.js" <<'EOF'
import express from "express";
import { listEvents } from "../events/event-store.service.js";

const router = express.Router();

router.get("/", (_req, res) => {
  const events = listEvents();

  res.json({
    ok: true,
    count: events.length,
    timeline: events
      .slice()
      .sort((a, b) =>
        String(a.createdAt).localeCompare(String(b.createdAt))
      )
      .map((event, index) => ({
        sequence: index + 1,
        id: event.id,
        type: event.type,
        createdAt: event.createdAt,
        payload: event.payload ?? {}
      }))
  });
});

export default router;
EOF

python3 - <<'PY'
from pathlib import Path

p = Path("apps/api-runtime/src/server.js")
s = p.read_text()

if 'timeline.routes.js' not in s:
    s = s.replace(
        'import eventStoreRoutes from "./modules/events/event-store.routes.js";',
        'import eventStoreRoutes from "./modules/events/event-store.routes.js";\nimport timelineRoutes from "./modules/timeline/timeline.routes.js";'
    )

if 'app.use("/api/v1/timeline", timelineRoutes);' not in s:
    s = s.replace(
        'app.use("/api/v1/events", eventStoreRoutes);',
        'app.use("/api/v1/events", eventStoreRoutes);\napp.use("/api/v1/timeline", timelineRoutes);'
    )

p.write_text(s)

print("timeline mounted")
PY

find "$APP/src" -name "*.js" -print0 | xargs -0 -n1 node --check && \

pm2 restart lvtransport-api --update-env && \
sleep 5 && \

curl -fsS http://127.0.0.1:3000/health && echo && \

curl -fsS -X POST http://127.0.0.1:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{"type":"TIMELINE_ENGINE_INITIALIZED","payload":{"source":"lv-incident-timeline-agent"}}' && echo && \

curl -fsS http://127.0.0.1:3000/api/v1/timeline && echo && \

git add apps/api-runtime scripts/agents/lv-incident-timeline-agent.sh && \
git commit -m "runtime(timeline): add incident timeline engine" || true && \

pm2 save && \

echo "===== INCIDENT TIMELINE AGENT DONE ====="

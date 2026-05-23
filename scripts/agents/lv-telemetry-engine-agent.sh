#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/lvtransport-platform"
APP="$ROOT/apps/api-runtime"
LOG="$ROOT/logs/lv-telemetry-engine-agent.log"

cd "$ROOT"

echo "===== TELEMETRY ENGINE AGENT $(date -u) =====" | tee "$LOG"

mkdir -p "$APP/src/modules/telemetry"

cat > "$APP/src/modules/telemetry/telemetry.routes.js" <<'EOF'
import express from "express";
import os from "node:os";
import process from "node:process";
import { execSync } from "node:child_process";

const router = express.Router();

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

router.get("/", (_req, res) => {
  const pm2 = safeExec("pm2 jlist");

  let pm2State = [];

  try {
    pm2State = JSON.parse(pm2 ?? "[]");
  } catch {}

  const runtime = pm2State.find(
    (p) => p.name === "lvtransport-api"
  );

  res.json({
    ok: true,
    timestamp: new Date().toISOString(),

    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      uptimeSeconds: os.uptime(),
      loadAverage: os.loadavg(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length
    },

    process: {
      pid: process.pid,
      nodeVersion: process.version,
      uptimeSeconds: process.uptime(),
      memory: process.memoryUsage()
    },

    runtime: runtime
      ? {
          name: runtime.name,
          pid: runtime.pid,
          restarts: runtime.pm2_env?.restart_time ?? 0,
          status: runtime.pm2_env?.status ?? "unknown",
          unstableRestarts:
            runtime.pm2_env?.unstable_restarts ?? 0,
          createdAt:
            runtime.pm2_env?.created_at ?? null,
          monit: runtime.monit ?? {}
        }
      : null
  });
});

export default router;
EOF

python3 - <<'PY'
from pathlib import Path

p = Path("apps/api-runtime/src/server.js")
s = p.read_text()

if 'telemetry.routes.js' not in s:
    s = s.replace(
        'import replayRoutes from "./modules/replay/replay.routes.js";',
        'import replayRoutes from "./modules/replay/replay.routes.js";\nimport telemetryRoutes from "./modules/telemetry/telemetry.routes.js";'
    )

if 'app.use("/api/v1/telemetry", telemetryRoutes);' not in s:
    s = s.replace(
        'app.use("/api/v1/replay", replayRoutes);',
        'app.use("/api/v1/replay", replayRoutes);\napp.use("/api/v1/telemetry", telemetryRoutes);'
    )

p.write_text(s)

print("telemetry mounted")
PY

find "$APP/src" -name "*.js" -print0 | xargs -0 -n1 node --check

pm2 restart lvtransport-api --update-env

sleep 5

curl -fsS http://127.0.0.1:3000/api/v1/telemetry | tee -a "$LOG"

echo "" | tee -a "$LOG"

curl -fsS -X POST http://127.0.0.1:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{"type":"TELEMETRY_ENGINE_INITIALIZED","payload":{"source":"lv-telemetry-engine-agent"}}' \
  | tee -a "$LOG"

echo "" | tee -a "$LOG"

git add apps/api-runtime scripts/agents/lv-telemetry-engine-agent.sh
git commit -m "runtime(telemetry): add operational telemetry engine" || true

pm2 save

echo "===== TELEMETRY ENGINE AGENT DONE =====" | tee -a "$LOG"

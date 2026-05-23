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

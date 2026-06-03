#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();

const repairs = [
  {
    id: "TS2305_DISPATCH_BOOKINGS_SERVICE_IMPORT",
    file: "apps/api/src/dispatch/dispatch.service.ts",
    type: "replace",
    from: "import { bookingsService } from '../bookings/bookings.service.js';",
    to: "import { bookingFlowService as bookingsService } from '../modules/bookings/service.js';"
  },
  {
    id: "TS2339_SOCKET_SHUTDOWN_GUARD",
    file: "apps/api/src/websocket/socket.server.ts",
    type: "guardShutdown"
  }
];

const beforeLog = "runtime/build/forge-v12-before.log";
const afterLog = "runtime/build/forge-v12-after.log";
const resultFile = "moni-core/founder/live/forge-v12-result.json";
const historyFile = "moni-core/repair/repair-history.json";
const runtimeFile = "runtime/build/repair-log.json";

function runBuild(log) {
  try {
    const out = execSync("pnpm --filter @lvtransport/api build", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    fs.writeFileSync(path.join(ROOT, log), out);
    return { ok: true, errors: 0 };
  } catch (err) {
    const out = `${err.stdout ?? ""}${err.stderr ?? ""}`;
    fs.writeFileSync(path.join(ROOT, log), out);
    return { ok: false, errors: (out.match(/error TS\d+/g) || []).length };
  }
}

function appendList(file, entry) {
  const full = path.join(ROOT, file);
  let data = [];
  if (fs.existsSync(full)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(full, "utf8"));
      data = Array.isArray(parsed) ? parsed : [parsed];
    } catch {}
  }
  data.push(entry);
  fs.writeFileSync(full, JSON.stringify(data, null, 2));
}

function backupFile(file) {
  const full = path.join(ROOT, file);
  const backup = `${full}.bak.forge-v12-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  fs.copyFileSync(full, backup);
  return backup;
}

const before = runBuild(beforeLog);
const applied = [];
const backups = [];

for (const repair of repairs) {
  const full = path.join(ROOT, repair.file);
  if (!fs.existsSync(full)) continue;

  let source = fs.readFileSync(full, "utf8");
  const backup = backupFile(repair.file);

  if (repair.type === "replace") {
    if (source.includes(repair.from)) {
      source = source.replace(repair.from, repair.to);
      fs.writeFileSync(full, source);
      applied.push(repair.id);
      backups.push(backup);
    }
  }

  if (repair.type === "guardShutdown") {
    if (source.includes(".shutdown();")) {
      source = source.replace(
        /([A-Za-z0-9_]+)\.shutdown\(\);/g,
        `if (typeof $1.shutdown === 'function') {
      $1.shutdown();
    }`
      );
      fs.writeFileSync(full, source);
      applied.push(repair.id);
      backups.push(backup);
    }
  }
}

const after = runBuild(afterLog);

let status = "VALIDATED";
let rollbackExecuted = false;

if (after.errors > before.errors) {
  for (const backup of backups) {
    const original = backup.replace(/\.bak\.forge-v12-.+$/, "");
    fs.copyFileSync(backup, original);
  }
  status = "REJECTED_ROLLBACK_EXECUTED";
  rollbackExecuted = true;
}

const result = {
  timestamp: new Date().toISOString(),
  forge: "FORGE_V12_AUTOFIX_LOW_RISK",
  status,
  applied,
  errorsBefore: before.errors,
  errorsAfter: after.errors,
  backups,
  rollbackExecuted,
  policy: "FORGE_RISK_POLICY_V1",
  targetedCodes: ["TS2305", "TS2339"]
};

fs.writeFileSync(path.join(ROOT, resultFile), JSON.stringify(result, null, 2));
appendList(historyFile, result);
appendList(runtimeFile, result);

console.log(JSON.stringify(result, null, 2));

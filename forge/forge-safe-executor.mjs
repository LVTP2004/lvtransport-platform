#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const target = path.join(ROOT, "apps/api/src/modules/bookings/repository.ts");

const buildLogBefore = path.join(ROOT, "runtime/build/forge-build-before.log");
const buildLogAfter = path.join(ROOT, "runtime/build/forge-build-after.log");
const resultJson = path.join(ROOT, "moni-core/founder/live/forge-result.json");
const repairHistory = path.join(ROOT, "moni-core/repair/repair-history.json");
const runtimeLog = path.join(ROOT, "runtime/build/repair-log.json");

function runBuild(logPath) {
  try {
    const out = execSync("pnpm --filter @lvtransport/api build", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    fs.writeFileSync(logPath, out);
    return { ok: true, errors: 0 };
  } catch (err) {
    const out = `${err.stdout ?? ""}${err.stderr ?? ""}`;
    fs.writeFileSync(logPath, out);
    const errors = (out.match(/error TS\d+/g) || []).length;
    return { ok: false, errors };
  }
}

function appendJsonList(file, entry) {
  let data = [];
  if (fs.existsSync(file)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
      data = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      data = [];
    }
  }
  data.push(entry);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function fail(reason) {
  const result = {
    timestamp: new Date().toISOString(),
    forge: "FORGE_V1_SAFE_EXECUTOR",
    status: "REJECTED",
    reason
  };
  fs.writeFileSync(resultJson, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}

if (!fs.existsSync(target)) fail("target file not found");

const before = runBuild(buildLogBefore);
const source = fs.readFileSync(target, "utf8");

if (source.includes("async getById(id: string): Promise<BookingRecord | null>")) {
  const after = runBuild(buildLogAfter);
  const result = {
    timestamp: new Date().toISOString(),
    forge: "FORGE_V1_SAFE_EXECUTOR",
    status: "NOOP_ALREADY_APPLIED",
    repairId: "P0_BOOKING_REPOSITORY_GETBYID",
    target: "apps/api/src/modules/bookings/repository.ts",
    errorsBefore: before.errors,
    errorsAfter: after.errors,
    rollbackAvailable: false
  };
  fs.writeFileSync(resultJson, JSON.stringify(result, null, 2));
  appendJsonList(repairHistory, result);
  appendJsonList(runtimeLog, result);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const marker = "  async create(record: BookingRecord): Promise<BookingRecord> {";
if (!source.includes(marker)) fail("safe insertion marker not found");

const backup = `${target}.bak.forge-${new Date().toISOString().replace(/[:.]/g, "-")}`;
fs.copyFileSync(target, backup);

const method = `  async getById(id: string): Promise<BookingRecord | null> {
    const store = this.readStore();
    return store.bookings.find((booking) => booking.id === id) ?? null;
  }

`;

const patched = source.replace(marker, method + marker);
fs.writeFileSync(target, patched);

const after = runBuild(buildLogAfter);

let status = "VALIDATED";
let rollbackExecuted = false;

if (after.errors > before.errors) {
  fs.copyFileSync(backup, target);
  status = "REJECTED_ROLLBACK_EXECUTED";
  rollbackExecuted = true;
}

const result = {
  timestamp: new Date().toISOString(),
  forge: "FORGE_V1_SAFE_EXECUTOR",
  repairId: "P0_BOOKING_REPOSITORY_GETBYID",
  status,
  target: "apps/api/src/modules/bookings/repository.ts",
  errorsBefore: before.errors,
  errorsAfter: after.errors,
  backup,
  rollbackAvailable: true,
  rollbackExecuted,
  policy: {
    confidence: 98,
    approvalRequired: false,
    maxFiles: 1
  }
};

fs.writeFileSync(resultJson, JSON.stringify(result, null, 2));
appendJsonList(repairHistory, result);
appendJsonList(runtimeLog, result);

console.log(JSON.stringify(result, null, 2));

#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { pathToFileURL } from "url";

const ROOT = process.cwd();
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");

const QUEUE_PATH = path.join(ROOT, "runtime/queue/work-queue.json");
const REGISTRY_PATH = path.join(ROOT, "moni-core/fixers/registry.json");
const CYCLE_DIR = path.join(ROOT, "runtime/moni/cycles");
const BACKUP_DIR = path.join(ROOT, "runtime/moni/backups", STAMP);
const BUILD_DIR = path.join(ROOT, "runtime/build");
const STATE_PATH = path.join(ROOT, "moni-core/founder/live/moni-repair-state.json");

const REPORT = path.join(CYCLE_DIR, `moni-repair-cycle-${STAMP}.md`);
const BUILD_BEFORE = path.join(BUILD_DIR, `moni-repair-before-${STAMP}.log`);
const BUILD_AFTER = path.join(BUILD_DIR, `moni-repair-after-${STAMP}.log`);
const BUILD_ROLLBACK = path.join(BUILD_DIR, `moni-repair-rollback-${STAMP}.log`);

fs.mkdirSync(CYCLE_DIR, { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });
fs.mkdirSync(BUILD_DIR, { recursive: true });
fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function sh(cmd) {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 1024 * 1024 * 50
    });
  } catch (e) {
    return `${e.stdout ?? ""}${e.stderr ?? ""}`;
  }
}

function verifier(logPath) {
  const out = sh("pnpm --filter @lvtransport/api build 2>&1");
  fs.writeFileSync(logPath, out);
  const errors = out.split("\n").filter((line) => /error TS\d+/.test(line));
  return { ok: errors.length === 0, errors, count: errors.length };
}

function normalizeTarget(target) {
  if (!target) return null;
  return target.startsWith("apps/api/") ? target : `apps/api/${target}`;
}

function currentTarget(queue) {
  const raw = queue?.current?.target || queue?.queue?.[0]?.target || null;
  return raw;
}

function findApprovedFixer(registry, target) {
  const approved = Array.isArray(registry.approved) ? registry.approved : [];
  return approved.find((fixer) => fixer.target === target || normalizeTarget(fixer.target) === normalizeTarget(target)) || null;
}

function backupFile(file) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) throw new Error(`backup_missing_source:${file}`);
  const dest = path.join(BACKUP_DIR, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(abs, dest);
  return dest;
}

function restoreBackup(file, backup) {
  const abs = path.join(ROOT, file);
  fs.copyFileSync(backup, abs);
}

async function applyFixer(fixer, file) {
  const abs = path.join(ROOT, file);
  const source = fs.readFileSync(abs, "utf8");
  const fixerPath = path.join(ROOT, fixer.file);
  const mod = await import(pathToFileURL(fixerPath).href);
  const fx = mod.fixer || mod.default || mod;
  if (!fx || typeof fx.apply !== "function") throw new Error(`invalid_fixer:${fixer.file}`);
  if (typeof fx.canApply === "function" && !fx.canApply(file)) throw new Error(`fixer_refused_target:${file}`);
  const next = await fx.apply(source, { root: ROOT, target: file });
  if (typeof next !== "string") throw new Error(`fixer_returned_non_string:${fixer.file}`);
  fs.writeFileSync(abs, next);
}

function updateQueue(queue, target, decision) {
  const q = queue || {};
  const list = Array.isArray(q.queue) ? q.queue : [];
  if (decision === "kept_verified") {
    q.completed = Array.isArray(q.completed) ? q.completed : [];
    q.completed.push({ target, completedAt: new Date().toISOString() });
    q.queue = list.filter((item) => item.target !== target);
    q.current = q.queue[0] || null;
  }
  q.generatedAt = new Date().toISOString();
  return q;
}

const queue = readJson(QUEUE_PATH, {});
const registry = readJson(REGISTRY_PATH, { approved: [], candidates: [] });
const target = currentTarget(queue);
const before = verifier(BUILD_BEFORE);
const approvedCount = Array.isArray(registry.approved) ? registry.approved.length : 0;

let state = {
  timestamp: new Date().toISOString(),
  target,
  beforeErrors: before.count,
  registryApproved: approvedCount,
  decision: null,
  fixer: null,
  backup: null,
  afterErrors: null,
  rollback: false,
  report: REPORT
};

if (before.ok) {
  state.decision = "green_no_repair_required";
} else if (!target) {
  state.decision = "blocked_no_queue_target";
} else {
  const fixer = findApprovedFixer(registry, target);
  if (!fixer) {
    state.decision = "blocked_no_approved_fixer";
  } else {
    const file = normalizeTarget(target);
    state.fixer = fixer.id || fixer.file;
    state.backup = backupFile(file);

    try {
      await applyFixer(fixer, file);
      const after = verifier(BUILD_AFTER);
      state.afterErrors = after.count;

      if (!after.ok || after.count > before.count) {
        restoreBackup(file, state.backup);
        const rollback = verifier(BUILD_ROLLBACK);
        state.rollback = true;
        state.decision = "rollback_verifier_failed";
        state.rollbackErrors = rollback.count;
      } else {
        state.decision = "kept_verified";
        const updatedQueue = updateQueue(queue, target, state.decision);
        writeJson(QUEUE_PATH, updatedQueue);
      }
    } catch (error) {
      restoreBackup(file, state.backup);
      const rollback = verifier(BUILD_ROLLBACK);
      state.rollback = true;
      state.decision = "rollback_exception";
      state.error = String(error);
      state.rollbackErrors = rollback.count;
    }
  }
}

writeJson(STATE_PATH, state);

fs.writeFileSync(REPORT, `# MONI REPAIR CYCLE ${STAMP}

## Loop
Observe → Analyze → Locate root cause → Propose patch → Evaluate impact → Backup → Modify → Verify → Rollback if failed → Update queue → Continue

## State
\`\`\`json
${JSON.stringify(state, null, 2)}
\`\`\`

## Canonical sources
- Queue: runtime/queue/work-queue.json
- Registry: moni-core/fixers/registry.json
- Reports: runtime/moni/cycles/
- Backups: runtime/moni/backups/

## Decision
${state.decision}
`);

console.log("===== MONI REPAIR ORCHESTRATOR V2 =====");
console.log(JSON.stringify(state, null, 2));

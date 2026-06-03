#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const QUEUE = path.join(ROOT, "moni-core/founder/live/moni-repair-queue.json");
const OUT = path.join(ROOT, "moni-core/founder/live/forge-approved-queue.json");
const REPORT = path.join(ROOT, "docs/forge/FORGE_V11_APPROVAL_GATE_REPORT.md");

function loadQueue() {
  if (!fs.existsSync(QUEUE)) return [];
  const raw = JSON.parse(fs.readFileSync(QUEUE, "utf8"));
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.queue)) return raw.queue;
  return [];
}

function isSafeRepair(item) {
  const confidence = Number(item.confidence ?? 0);
  const file = String(item.file ?? "");
  const errors = Array.isArray(item.errors) ? item.errors : [];

  const singleFile = file.length > 0 && !file.includes(",") && !file.includes(" ");
  const isApiSrc = file.startsWith("src/") || file.startsWith("apps/api/src/");
  const touchesStructuralMigration =
    /migration|convergence|legacy cleanup|dispatch convergence|booking migration|tracking migration/i.test(
      `${item.domain ?? ""} ${item.action ?? ""}`
    );

  const safeErrorCodes = new Set(["TS2305", "TS2339", "TS2345", "TS7006"]);
  const errorCodesSafe =
    errors.length === 0 ||
    errors.every((e) => safeErrorCodes.has(String(e.code ?? "")));

  return (
    confidence >= 90 &&
    singleFile &&
    isApiSrc &&
    errorCodesSafe &&
    !touchesStructuralMigration
  );
}

const queue = loadQueue();

const approved = queue.map((item) => {
  const safe = isSafeRepair(item);
  return {
    ...item,
    forgeApproval: safe ? "APPROVED_FOR_FORGE" : "FOUNDER_APPROVAL_REQUIRED",
    approvalReason: safe
      ? "single-file high-confidence TypeScript repair"
      : "structural, low-confidence, or multi-file repair"
  };
});

const approvedForForge = approved.filter((x) => x.forgeApproval === "APPROVED_FOR_FORGE");

fs.writeFileSync(OUT, JSON.stringify({
  timestamp: new Date().toISOString(),
  gate: "FORGE_V11_APPROVAL_GATE",
  approvedCount: approvedForForge.length,
  queue: approved
}, null, 2));

fs.writeFileSync(REPORT, `# FORGE V1.1 APPROVAL GATE REPORT

Status: ACTIVE

Timestamp: ${new Date().toISOString()}

Approved for Forge: ${approvedForForge.length}

## Rule

Forge may auto-approve repairs when:

- confidence >= 90
- single file
- API source file
- non-structural migration
- safe TypeScript error class

## Approved Repairs

${approvedForForge.map((x) => `- ${x.priority ?? "P?"}: ${x.domain ?? "unknown"} — ${x.file ?? "unknown"}`).join("\n") || "None"}

## Founder Approval Required

${approved.filter((x) => x.forgeApproval !== "APPROVED_FOR_FORGE").map((x) => `- ${x.priority ?? "P?"}: ${x.domain ?? "unknown"} — ${x.file ?? "unknown"}`).join("\n") || "None"}
`);

console.log(JSON.stringify({
  gate: "FORGE_V11_APPROVAL_GATE",
  approvedCount: approvedForForge.length,
  approved: approvedForForge.map((x) => ({
    priority: x.priority,
    domain: x.domain,
    file: x.file
  }))
}, null, 2));

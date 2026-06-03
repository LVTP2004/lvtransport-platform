#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const RUNTIME_DIR = path.join(ROOT, "runtime/build");
const LIVE_DIR = path.join(ROOT, "moni-core/founder/live");
const DOC_DIR = path.join(ROOT, "docs/moni");

fs.mkdirSync(RUNTIME_DIR, { recursive: true });
fs.mkdirSync(LIVE_DIR, { recursive: true });
fs.mkdirSync(DOC_DIR, { recursive: true });

const buildLog = path.join(RUNTIME_DIR, "moni-repair-api-build.log");
const queueJson = path.join(LIVE_DIR, "moni-repair-queue.json");
const stateJson = path.join(LIVE_DIR, "moni-repair-state.json");
const reportMd = path.join(DOC_DIR, "MONI_REPAIR_ORCHESTRATOR_V1.md");

function runBuild() {
  try {
    const out = execSync("pnpm --filter @lvtransport/api build", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    fs.writeFileSync(buildLog, out);
    return out;
  } catch (err) {
    const out = `${err.stdout ?? ""}${err.stderr ?? ""}`;
    fs.writeFileSync(buildLog, out);
    return out;
  }
}

function parseErrors(log) {
  return log
    .split("\n")
    .filter((line) => /error TS\d+/.test(line))
    .map((line) => {
      const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
      if (!match) return { raw: line };
      return {
        file: match[1],
        line: Number(match[2]),
        column: Number(match[3]),
        code: match[4],
        message: match[5],
        raw: line
      };
    });
}

function classify(error) {
  const file = error.file ?? "";
  const msg = error.message ?? "";

  if (file.includes("modules/bookings/repository.ts")) {
    return {
      priority: "P0",
      domain: "Booking Repository Contract",
      confidence: 98,
      action: "Implement missing getById method in FileBookingRepository and align BookingRepository interface.",
      approvalRequired: false
    };
  }

  if (file.includes("bookings/booking.service.ts")) {
    return {
      priority: "P1",
      domain: "Booking Runtime Contract",
      confidence: 82,
      action: "Align legacy BookingService record shape with active BookingRecord contract without deleting runtime booking layer.",
      approvalRequired: true
    };
  }

  if (file.includes("dispatch/dispatch.service.ts")) {
    return {
      priority: "P2",
      domain: "Dispatch Import Alignment",
      confidence: 90,
      action: "Replace bookingsService import with the actual exported booking engine or booking flow service.",
      approvalRequired: true
    };
  }

  if (file.includes("payments")) {
    return {
      priority: "P3",
      domain: "Payment Architecture Contract",
      confidence: 88,
      action: "Add required customerId/requestedBy fields and restore/replace PaymentProvider type.",
      approvalRequired: true
    };
  }

  if (file.includes("websocket/socket.server.ts")) {
    return {
      priority: "P4",
      domain: "WebSocket Lifecycle Contract",
      confidence: 86,
      action: "Add or guard shutdown() call against booking service lifecycle object.",
      approvalRequired: true
    };
  }

  return {
    priority: "P9",
    domain: "Unknown",
    confidence: 50,
    action: "Founder review required.",
    approvalRequired: true
  };
}

function groupQueue(errors) {
  const grouped = new Map();

  for (const error of errors) {
    const c = classify(error);
    const key = `${c.priority}:${c.domain}:${error.file}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        priority: c.priority,
        domain: c.domain,
        file: error.file ?? "unknown",
        confidence: c.confidence,
        approvalRequired: c.approvalRequired,
        action: c.action,
        errors: []
      });
    }
    grouped.get(key).errors.push({
      code: error.code,
      line: error.line,
      column: error.column,
      message: error.message,
      raw: error.raw
    });
  }

  return [...grouped.values()].sort((a, b) => {
    const pa = Number(a.priority.replace("P", ""));
    const pb = Number(b.priority.replace("P", ""));
    return pa - pb || b.confidence - a.confidence;
  });
}

const log = runBuild();
const errors = parseErrors(log);
const queue = groupQueue(errors);

const state = {
  timestamp: new Date().toISOString(),
  status: errors.length === 0 ? "GREEN" : "BLOCKED",
  buildErrors: errors.length,
  autonomy: {
    current: 15,
    recommended: errors.length === 0 ? 25 : 15,
    reason: errors.length === 0
      ? "API build is green; limited autonomous patching can increase."
      : "API build is still blocked; Moni may propose but should not freely execute."
  },
  nextRepair: queue[0] ?? null,
  queue
};

fs.writeFileSync(stateJson, JSON.stringify(state, null, 2));
fs.writeFileSync(queueJson, JSON.stringify(queue, null, 2));

const report = `# MONI REPAIR ORCHESTRATOR V1

Status: ${state.status}

Date: ${state.timestamp}

## Purpose

Transform build failures into an ordered repair queue.

## Current Build Errors

${state.buildErrors}

## Autonomy

Current: ${state.autonomy.current}%

Recommended: ${state.autonomy.recommended}%

Reason: ${state.autonomy.reason}

## Next Repair

${state.nextRepair ? `
Priority: ${state.nextRepair.priority}

Domain: ${state.nextRepair.domain}

File: ${state.nextRepair.file}

Confidence: ${state.nextRepair.confidence}%

Approval Required: ${state.nextRepair.approvalRequired}

Action:

${state.nextRepair.action}
` : "No repair required. Build is green."}

## Repair Queue

\`\`\`json
${JSON.stringify(queue, null, 2)}
\`\`\`

## Rule

Moni may analyze and propose repairs.

Moni may not apply high-risk patches without Founder approval.

END
`;

fs.writeFileSync(reportMd, report);

console.log(JSON.stringify(state, null, 2));

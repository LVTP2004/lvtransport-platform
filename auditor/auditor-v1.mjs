#!/usr/bin/env node
import fs from "fs";

const beforeLog = "runtime/build/forge-v12-before.log";
const afterLog = "runtime/build/forge-v12-after.log";
const forgeResult = "moni-core/founder/live/forge-v12-result.json";
const out = "moni-core/founder/live/auditor-v1-report.json";
const md = "docs/auditor/AUDITOR_V1_REPORT.md";

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function errors(log) {
  return [...log.matchAll(/src\/[^\s]+\.ts\(\d+,\d+\): error TS\d+:[^\n]+/g)].map(m => m[0]);
}

const beforeErrors = errors(read(beforeLog));
const afterErrors = errors(read(afterLog));

const beforeSet = new Set(beforeErrors);
const afterSet = new Set(afterErrors);

const resolved = beforeErrors.filter(e => !afterSet.has(e));
const introduced = afterErrors.filter(e => !beforeSet.has(e));

let forge = {};
try {
  forge = JSON.parse(read(forgeResult));
} catch {}

let verdict = "NO_CHANGE";
if (afterErrors.length < beforeErrors.length && introduced.length === 0) verdict = "APPROVED_IMPROVED";
else if (afterErrors.length < beforeErrors.length && introduced.length > 0) verdict = "APPROVED_WITH_NEW_SURFACE";
else if (afterErrors.length > beforeErrors.length) verdict = "REJECT_ROLLBACK_RECOMMENDED";

const report = {
  timestamp: new Date().toISOString(),
  auditor: "AUDITOR_V1",
  verdict,
  errorsBefore: beforeErrors.length,
  errorsAfter: afterErrors.length,
  resolvedCount: resolved.length,
  introducedCount: introduced.length,
  forgeStatus: forge.status ?? "UNKNOWN",
  applied: forge.applied ?? [],
  resolved,
  introduced,
  nextRecommendation:
    verdict.startsWith("APPROVED")
      ? "Proceed to next smallest non-payment blocker."
      : "Do not proceed until rollback or manual review."
};

fs.writeFileSync(out, JSON.stringify(report, null, 2));

fs.writeFileSync(md, `# AUDITOR V1 REPORT

Status: ${verdict}

Errors before: ${beforeErrors.length}

Errors after: ${afterErrors.length}

Resolved: ${resolved.length}

Introduced: ${introduced.length}

Forge status: ${forge.status ?? "UNKNOWN"}

## Applied

${(forge.applied ?? []).map(x => `- ${x}`).join("\n") || "None"}

## Recommendation

${report.nextRecommendation}
`);

console.log(JSON.stringify(report, null, 2));

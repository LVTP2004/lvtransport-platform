#!/usr/bin/env bash
set -euo pipefail

LOG="runtime/build/api-learning-build.log"
OUT="moni-core/learning/api-error-patterns.json"
QUEUE="moni-core/queue/api-fix-queue.json"
REPORT="docs/architecture/bootstrap/MONI_API_ERROR_LEARNING_V1.md"

pnpm --filter @lvtransport/api build > "$LOG" 2>&1 || true

python3 <<'PY'
from pathlib import Path
import json, re
from collections import Counter, defaultdict
from datetime import datetime

log = Path("runtime/build/api-learning-build.log").read_text(errors="ignore")
errors = [l for l in log.splitlines() if "error TS" in l]

patterns = []
counts = Counter()
by_file = defaultdict(list)

rules = [
    ("duplicate_declaration", ["Duplicate identifier", "Cannot redeclare", "Duplicate function implementation"]),
    ("missing_import_or_contract", ["Cannot find name"]),
    ("wrong_method_contract", ["Property", "does not exist"]),
    ("type_mismatch", ["is not assignable"]),
    ("wrong_argument_count", ["Expected", "arguments"]),
    ("sqlite_input_type", ["SQLInputValue"]),
    ("implicit_any", ["implicitly has an 'any' type"]),
]

for line in errors:
    m = re.search(r"src/([^(:]+)", line)
    file = "src/" + m.group(1) if m else "unknown"
    kind = "unknown"
    for name, keys in rules:
        if all(k in line for k in keys) or any(k in line for k in keys):
            kind = name
            break
    counts[kind] += 1
    by_file[file].append(line)

summary = {
    "generatedAt": datetime.utcnow().isoformat() + "Z",
    "totalErrors": len(errors),
    "errorTypes": dict(counts),
    "topFiles": dict(Counter({k: len(v) for k, v in by_file.items()}).most_common(20)),
}

queue = []
for file, lines in sorted(by_file.items(), key=lambda x: len(x[1]), reverse=True):
    dominant = Counter()
    for line in lines:
        for name, keys in rules:
            if any(k in line for k in keys):
                dominant[name] += 1
    queue.append({
        "file": file,
        "errorCount": len(lines),
        "primaryPattern": dominant.most_common(1)[0][0] if dominant else "unknown",
        "strategy": {
            "duplicate_declaration": "remove duplicated blocks or choose one canonical implementation",
            "missing_import_or_contract": "import canonical type from packages/shared or local contract",
            "wrong_method_contract": "align caller with repository/service interface",
            "type_mismatch": "adapt object shape to declared type",
            "wrong_argument_count": "align function signature or caller",
            "sqlite_input_type": "cast sqlite rows and bind values safely",
            "implicit_any": "add explicit parameter types",
            "unknown": "manual inspection required"
        }.get(dominant.most_common(1)[0][0] if dominant else "unknown")
    })

Path("moni-core/learning/api-error-patterns.json").write_text(json.dumps(summary, indent=2) + "\n")
Path("moni-core/queue/api-fix-queue.json").write_text(json.dumps(queue, indent=2) + "\n")

report = [
"# MONI API ERROR LEARNING V1",
"",
"Status: GENERATED",
"Category: Moni Learning / API Stabilization",
f"Date: {datetime.utcnow().date()}",
"",
"## Summary",
"```json",
json.dumps(summary, indent=2),
"```",
"",
"## Fix Queue",
"```json",
json.dumps(queue[:12], indent=2),
"```",
"",
"## Decision",
"Moni must fix API build errors by pattern, not by random file edits.",
"Each fix must reduce the TypeScript error count and be committed separately.",
]
Path("docs/architecture/bootstrap/MONI_API_ERROR_LEARNING_V1.md").write_text("\n".join(report) + "\n")
PY

echo "===== MONI LEARNING REPORT ====="
cat "$OUT"

echo
echo "===== NEXT FIX QUEUE ====="
cat "$QUEUE" | sed -n '1,160p'

git add scripts/moni-learn-api-errors.sh moni-core/learning/api-error-patterns.json moni-core/queue/api-fix-queue.json docs/architecture/bootstrap/MONI_API_ERROR_LEARNING_V1.md
git commit -m "chore(moni): learn api build error patterns" || true

git status

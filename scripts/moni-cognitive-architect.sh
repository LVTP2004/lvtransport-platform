#!/usr/bin/env bash
set -euo pipefail

BUILD_LOG="runtime/build/moni-cognitive-api-build.log"
GRAPH="moni-core/knowledge/repository-knowledge-graph.json"
STATE="moni-core/cognitive/current-repository-state.json"
QUEUE="moni-core/queue/cognitive-fix-queue.json"
REPORT="docs/architecture/bootstrap/MONI_COGNITIVE_ARCHITECT_V1.md"

pnpm --filter @lvtransport/api build > "$BUILD_LOG" 2>&1 || true

python3 <<'PY'
from pathlib import Path
import json, re
from collections import Counter, defaultdict
from datetime import datetime

build_log = Path("runtime/build/moni-cognitive-api-build.log")
text = build_log.read_text(errors="ignore") if build_log.exists() else ""
errors = [line for line in text.splitlines() if "error TS" in line]

modules = {
  "persistence": ["persistence", "sqlite", "repository", "contracts"],
  "payments": ["payment", "payments"],
  "notifications": ["notification", "notifications"],
  "auth": ["auth", "authenticate", "authorize", "access-control"],
  "bookings": ["booking", "bookings"],
  "tracking": ["tracking"],
  "websocket": ["websocket", "socket"],
  "operational_memory": ["operational-memory", "memory"],
  "server": ["server.ts"]
}

patterns = {
  "duplicate_implementation": ["Duplicate identifier", "Cannot redeclare", "Duplicate function implementation"],
  "missing_contract": ["Cannot find name"],
  "contract_shape_mismatch": ["is missing in type", "is not assignable"],
  "wrong_method_contract": ["does not exist on type"],
  "wrong_argument_count": ["Expected", "arguments"],
  "sqlite_binding": ["SQLInputValue"],
  "implicit_any": ["implicitly has an 'any' type"],
}

def classify_module(line):
    low = line.lower()
    for module, keys in modules.items():
        if any(k in low for k in keys):
            return module
    return "unknown"

def classify_pattern(line):
    for name, keys in patterns.items():
        if all(k in line for k in keys) or any(k in line for k in keys):
            return name
    return "unknown"

by_module = defaultdict(list)
by_file = defaultdict(list)
by_pattern = Counter()

for line in errors:
    module = classify_module(line)
    pattern = classify_pattern(line)
    by_module[module].append(line)
    by_pattern[pattern] += 1
    m = re.search(r"src/([^(:]+)", line)
    file = "src/" + m.group(1) if m else "unknown"
    by_file[file].append(line)

graph = {
  "name": "LVTP Repository Knowledge Graph",
  "generatedAt": datetime.utcnow().isoformat() + "Z",
  "principle": "Moni reasons from subsystem ownership, not isolated TypeScript lines.",
  "canonicalContracts": {
    "shared": [
      "packages/shared/src/ride-lifecycle.ts",
      "packages/shared/src/tracking.ts",
      "packages/shared/src/booking.types.ts",
      "packages/shared/src/dispatch.types.ts",
      "packages/shared/src/pricing.types.ts",
      "packages/shared/src/moni.types.ts"
    ],
    "apiPersistence": [
      "apps/api/src/persistence/repository-contracts.ts",
      "apps/api/src/modules/persistence/contracts.ts"
    ]
  },
  "subsystems": {
    "persistence": {
      "owns": ["repository contracts", "sqlite repositories", "in-memory repositories"],
      "risk": "high",
      "rule": "Patch by interface alignment, not by individual TS errors."
    },
    "payments": {
      "owns": ["payment session lifecycle", "refund state", "transaction history"],
      "risk": "high",
      "rule": "Reconcile payment types before route/service method fixes."
    },
    "notifications": {
      "owns": ["queue", "delivery lifecycle", "operational alerts"],
      "risk": "medium",
      "rule": "Service contract must match route and booking notification flow."
    },
    "auth": {
      "owns": ["middleware", "role authorization", "access control"],
      "risk": "medium",
      "rule": "Do not change runtime auth semantics while stabilizing build."
    },
    "tracking": {
      "owns": ["tracking code generation", "tracking lookup"],
      "risk": "medium",
      "rule": "Use packages/shared tracking contract."
    }
  }
}

state = {
  "generatedAt": datetime.utcnow().isoformat() + "Z",
  "totalTypeScriptErrors": len(errors),
  "errorsByModule": {k: len(v) for k, v in sorted(by_module.items(), key=lambda x: len(x[1]), reverse=True)},
  "errorsByPattern": dict(by_pattern),
  "topFiles": {k: len(v) for k, v in sorted(by_file.items(), key=lambda x: len(x[1]), reverse=True)[:25]},
}

strategy = {
  "persistence": "Rebuild repository implementations against declared interfaces.",
  "payments": "Normalize payment interfaces before touching payment routes.",
  "notifications": "Keep service, route, and booking notification flow aligned.",
  "auth": "Stabilize exported auth types and middleware signatures.",
  "tracking": "Remove duplicate tracking implementations and delegate to shared tracking.",
  "websocket": "Remove duplicate broadcast declarations.",
  "operational_memory": "Remove duplicate CLI entrypoints or isolate executable module.",
  "server": "Remove duplicate start declarations."
}

queue = []
for module, lines in sorted(by_module.items(), key=lambda x: len(x[1]), reverse=True):
    queue.append({
      "module": module,
      "errorCount": len(lines),
      "primaryPattern": Counter(classify_pattern(x) for x in lines).most_common(1)[0][0],
      "strategy": strategy.get(module, "Manual architecture review required."),
      "firstErrors": lines[:8]
    })

Path("moni-core/knowledge/repository-knowledge-graph.json").write_text(json.dumps(graph, indent=2) + "\n")
Path("moni-core/cognitive/current-repository-state.json").write_text(json.dumps(state, indent=2) + "\n")
Path("moni-core/queue/cognitive-fix-queue.json").write_text(json.dumps(queue, indent=2) + "\n")

report = [
"# MONI COGNITIVE ARCHITECT V1",
"",
"Status: GENERATED",
"Category: Moni Cognitive Architecture",
f"Date: {datetime.utcnow().date()}",
"",
"## Purpose",
"",
"Teach Moni to reason like an architect: subsystem first, TypeScript error second.",
"",
"## Current Repository State",
"",
"```json",
json.dumps(state, indent=2),
"```",
"",
"## Cognitive Fix Queue",
"",
"```json",
json.dumps(queue[:10], indent=2),
"```",
"",
"## Operating Rule",
"",
"Moni must not patch isolated errors blindly. Moni must identify the broken subsystem, align it with its canonical contract, rebuild, measure, and only keep fixes that reduce the build error count.",
"",
"## Next Action",
"",
"Run the first item in moni-core/queue/cognitive-fix-queue.json as the next controlled repair target.",
""
]
Path("docs/architecture/bootstrap/MONI_COGNITIVE_ARCHITECT_V1.md").write_text("\n".join(report))
PY

echo "Generated:"
ls -lh "$GRAPH" "$STATE" "$QUEUE" "$REPORT"

echo
echo "===== STATE ====="
cat "$STATE"

echo
echo "===== NEXT QUEUE ====="
cat "$QUEUE" | sed -n '1,180p'

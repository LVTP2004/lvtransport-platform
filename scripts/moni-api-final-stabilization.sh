#!/usr/bin/env bash
set -euo pipefail

LOG="/tmp/api-final-check.log"
REPORT="docs/architecture/bootstrap/MONI_API_FINAL_STABILIZATION_V1.md"
QUEUE="moni-core/queue/api-final-stabilization-queue.json"

mkdir -p docs/architecture/bootstrap moni-core/queue runtime/build

pnpm --filter @lvtransport/api build > "$LOG" 2>&1 || true

python3 <<'PY'
from pathlib import Path
import json, re
from collections import Counter, defaultdict
from datetime import datetime

log = Path("/tmp/api-final-check.log").read_text(errors="ignore")
errors = [l for l in log.splitlines() if "error TS" in l]

by_file = defaultdict(list)
for line in errors:
    m = re.search(r"src/([^(:]+)", line)
    file = m.group(1) if m else "unknown"
    by_file[file].append(line)

queue = []
for file, lines in sorted(by_file.items(), key=lambda x: len(x[1]), reverse=True):
    if "operational-memory/cli.ts" in file:
        action = "Remove duplicate CLI declarations and keep one canonical main entrypoint."
    elif "payment-architecture.service.ts" in file:
        action = "Reconcile PaymentSession, RefundState and TransactionHistoryEntry contracts."
    elif "bookings/booking.service.ts" in file:
        action = "Replace BookingLifecycle mismatch with canonical RideStatus/shared lifecycle."
    elif "websocket/socket.server.ts" in file:
        action = "Remove duplicate broadcast/start declarations."
    elif "sqlite.repositories.ts" in file:
        action = "Align SQLite row mappings with persistence contracts."
    else:
        action = "Inspect and apply contract-aligned repair."

    queue.append({
        "file": file,
        "errorCount": len(lines),
        "priority": len(lines),
        "recommendedAction": action,
        "errors": lines[:8]
    })

summary = {
    "generatedAt": datetime.utcnow().isoformat() + "Z",
    "objective": "API_BUILD_ZERO_ERRORS",
    "totalErrors": len(errors),
    "topTargets": queue[:10],
    "nextTarget": queue[0] if queue else None
}

Path("moni-core/queue/api-final-stabilization-queue.json").write_text(json.dumps(queue, indent=2) + "\n")

report = [
"# MONI API FINAL STABILIZATION V1",
"",
"Status: GENERATED",
"Category: Moni Executive Repair Queue",
f"Date: {datetime.utcnow().date()}",
"",
"## Summary",
"```json",
json.dumps(summary, indent=2),
"```",
"",
"## Rule",
"",
"Moni must repair by highest-impact file first, rebuild after each repair, and only keep changes that reduce the TypeScript error count.",
"",
"## Current Strategy",
"",
"37 → 20 → 10 → 0",
""
]

Path("docs/architecture/bootstrap/MONI_API_FINAL_STABILIZATION_V1.md").write_text("\n".join(report))
PY

echo "===== MONI FINAL QUEUE ====="
cat "$QUEUE" | sed -n '1,220p'

git add scripts/moni-api-final-stabilization.sh "$QUEUE" "$REPORT"
git commit -m "chore(moni): add api final stabilization queue" || true

git status

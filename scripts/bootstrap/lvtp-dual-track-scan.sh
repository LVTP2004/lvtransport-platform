#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/lvtransport-platform"
cd "$ROOT" || exit 1

mkdir -p runtime/build moni-core/founder/live

OUT="runtime/build/lvtp-dual-track-scan.log"
STATE="moni-core/founder/live/lvtp-dual-track-state.json"

{
  echo "===== LVTP DUAL TRACK SCAN ====="
  date -Iseconds
  echo

  echo "===== GIT ====="
  git branch --show-current || true
  git status --short || true
  echo

  echo "===== PLATFORM TRACK FILES ====="
  for f in \
    apps/api/src/modules/persistence/sqlite.repositories.ts \
    apps/api/src/modules/persistence/contracts.ts \
    apps/api/src/modules/persistence/in-memory-empty.repository.ts \
    apps/api/src/modules/persistence/repository-contracts.ts
  do
    if [ -f "$f" ]; then
      echo "FOUND: $f"
    else
      echo "MISSING: $f"
    fi
  done
  echo

  echo "===== FOUNDER AWARENESS FILES ====="
  find docs/founder apps/moni-dashboard apps/web/src/pages packages/realtime/src/notifications apps/api/src/notifications moni-core/founder/live \
    -maxdepth 4 \
    \( -iname "*severity*" -o -iname "*notification*" -o -iname "*dashboard*" -o -iname "*founder*" -o -iname "*edge*" \) \
    2>/dev/null | sort | head -120
  echo

  echo "===== API BUILD SAMPLE ====="
  pnpm --filter @lvtransport/api build 2>&1 | tee runtime/build/api-build-current.log || true

} | tee "$OUT"

ERROR_COUNT="$(grep -Eo 'error TS[0-9]+' runtime/build/api-build-current.log 2>/dev/null | wc -l | tr -d ' ')"

cat > "$STATE" <<JSON
{
  "timestamp": "$(date -Iseconds)",
  "track_a_platform": {
    "status": "$([ "$ERROR_COUNT" = "0" ] && echo "GREEN" || echo "BLOCKED")",
    "target": "API Build Green",
    "api_build_errors": $ERROR_COUNT,
    "current_blocker": "apps/api/src/modules/persistence/sqlite.repositories.ts",
    "next_action": "Persistence Contract Reconciliation"
  },
  "track_b_founder_awareness": {
    "status": "ACTIVE",
    "target": "Watcher to Dashboard to Notifications to MONI Edge",
    "next_action": "Create awareness loop integration map"
  },
  "forbidden_until_api_green": [
    "Dispatch Migration",
    "Booking Migration",
    "Tracking Migration",
    "Driver Migration",
    "Moni Verified Context Migration",
    "Legacy Cleanup"
  ]
}
JSON

echo
echo "===== STATE ====="
cat "$STATE"

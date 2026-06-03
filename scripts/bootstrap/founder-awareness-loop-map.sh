#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/lvtransport-platform"
cd "$ROOT" || exit 1

mkdir -p runtime/build moni-core/founder/live docs/founder

OUT_JSON="moni-core/founder/live/founder-awareness-loop-map.json"
OUT_MD="docs/founder/FOUNDER_AWARENESS_LOOP_MAP_V1.md"

WATCHER_FILES="$(find . -iname "*watcher*" 2>/dev/null | grep -v node_modules | grep -v runtime/moni/backups | sort | head -50 || true)"
SEVERITY_FILES="$(find . -iname "*severity*" 2>/dev/null | grep -v node_modules | grep -v runtime/moni/backups | sort | head -50 || true)"
NOTIFICATION_FILES="$(find . -iname "*notification*" 2>/dev/null | grep -v node_modules | grep -v runtime/moni/backups | sort | head -80 || true)"
DASHBOARD_FILES="$(find . -iname "*dashboard*" -o -iname "*founder*" 2>/dev/null | grep -v node_modules | grep -v runtime/moni/backups | sort | head -80 || true)"
EDGE_FILES="$(find . -iname "*edge*" -o -iname "*nats*" 2>/dev/null | grep -v node_modules | grep -v runtime/moni/backups | sort | head -80 || true)"

cat > "$OUT_JSON" <<JSON
{
  "timestamp": "$(date -Iseconds)",
  "status": "MAPPED",
  "loop": [
    "Watcher",
    "Severity Model",
    "Founder Notifications",
    "Founder Dashboard",
    "MONI Edge",
    "Founder Awareness"
  ],
  "next_action": "Wire test event from watcher into dashboard and notification policy",
  "success_condition": "Founder receives a classified actionable summary"
}
JSON

{
  echo "# FOUNDER AWARENESS LOOP MAP V1"
  echo
  echo "Status: MAPPED"
  echo
  echo "Date: $(date -Iseconds)"
  echo
  echo "## Loop"
  echo
  echo "Watcher → Severity → Founder Notifications → Founder Dashboard → MONI Edge → Founder Awareness"
  echo
  echo "## Watcher Files"
  echo '```'
  echo "$WATCHER_FILES"
  echo '```'
  echo
  echo "## Severity Files"
  echo '```'
  echo "$SEVERITY_FILES"
  echo '```'
  echo
  echo "## Notification Files"
  echo '```'
  echo "$NOTIFICATION_FILES"
  echo '```'
  echo
  echo "## Dashboard / Founder Files"
  echo '```'
  echo "$DASHBOARD_FILES"
  echo '```'
  echo
  echo "## Edge / NATS Files"
  echo '```'
  echo "$EDGE_FILES"
  echo '```'
  echo
  echo "## Next Action"
  echo
  echo "Wire a test event through the loop and verify the Founder receives one compressed actionable summary."
} > "$OUT_MD"

echo "Created:"
echo "$OUT_JSON"
echo "$OUT_MD"

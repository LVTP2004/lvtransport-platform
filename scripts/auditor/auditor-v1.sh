#!/usr/bin/env bash
set -euo pipefail
cd "$HOME/lvtransport-platform" || exit 1

echo "===== AUDITOR V1 ====="
node auditor/auditor-v1.mjs

echo
echo "===== AUDITOR REPORT ====="
cat moni-core/founder/live/auditor-v1-report.json

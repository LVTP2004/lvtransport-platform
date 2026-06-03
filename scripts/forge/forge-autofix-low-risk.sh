#!/usr/bin/env bash
set -euo pipefail
cd "$HOME/lvtransport-platform" || exit 1

echo "===== FORGE V1.2 AUTOFIX LOW RISK ====="
node forge/forge-autofix-low-risk.mjs

echo
echo "===== RESULT ====="
cat moni-core/founder/live/forge-v12-result.json

echo
echo "===== REMAINING ERRORS ====="
grep -E "error TS[0-9]+" runtime/build/forge-v12-after.log || true

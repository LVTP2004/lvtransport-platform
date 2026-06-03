#!/usr/bin/env bash
set -euo pipefail
cd "$HOME/lvtransport-platform" || exit 1

echo "===== FORGE V1 SAFE EXECUTOR ====="
node forge/forge-safe-executor.mjs

echo
echo "===== FORGE RESULT ====="
cat moni-core/founder/live/forge-result.json

echo
echo "===== REMAINING ERRORS ====="
grep -E "error TS[0-9]+" runtime/build/forge-build-after.log || true

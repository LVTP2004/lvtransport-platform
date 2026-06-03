#!/usr/bin/env bash
set -euo pipefail
cd "$HOME/lvtransport-platform" || exit 1

echo "===== FORGE V1.1 APPROVAL GATE ====="
node forge/forge-approval-gate.mjs

echo
echo "===== APPROVED QUEUE ====="
cat moni-core/founder/live/forge-approved-queue.json

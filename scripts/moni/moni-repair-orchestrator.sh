#!/usr/bin/env bash
set -euo pipefail

cd "$HOME/lvtransport-platform" || exit 1

echo "===== MONI REPAIR ORCHESTRATOR V1 ====="
node moni-core/repair/moni-repair-orchestrator.mjs

echo
echo "State:"
cat moni-core/founder/live/moni-repair-state.json

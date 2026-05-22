#!/usr/bin/env bash
set -euo pipefail

cd ~/lvtransport-platform
node tools/memory-engine/query-memory.mjs "$@"

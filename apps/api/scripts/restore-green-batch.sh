#!/usr/bin/env bash
set -euo pipefail

BACKUP=".broken-src-backup/src-20260606-200557"

for path in "$BACKUP"/{pricing,operational-memory,forecasting,policy,integrity,knowledge-graph,lineage,customers,admin}; do
  [ -e "$path" ] || continue
  rel="${path#$BACKUP/}"

  echo "=== trying $rel ==="
  mkdir -p "src/$(dirname "$rel")"
  cp -R "$path" "src/$rel"

  if ../../node_modules/.bin/tsc -p tsconfig.json && ../../node_modules/.bin/tsc --noEmit; then
    git add "apps/api/src/$rel" 2>/dev/null || git add "src/$rel"
    echo "GREEN: $rel"
  else
    echo "ROLLBACK: $rel"
    rm -rf "src/$rel"
    git restore --staged "src/$rel" 2>/dev/null || true
  fi
done

git status --short

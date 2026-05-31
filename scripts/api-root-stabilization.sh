#!/usr/bin/env bash
set -euo pipefail

LOG="runtime/build/api-build-root.log"
REPORT="docs/architecture/bootstrap/API_ROOT_STABILIZATION_V1.md"
LIB_REPORT="/lvtp-data/library/architecture/bootstrap/API_ROOT_STABILIZATION_V1.md"

mkdir -p runtime/build docs/architecture/bootstrap /lvtp-data/library/architecture/bootstrap

rm -f api-build-report*.txt api-errors*.txt

pnpm --filter @lvtransport/api build > "$LOG" 2>&1 || true

ERROR_COUNT="$(grep -c "error TS" "$LOG" || true)"

{
  echo "# API ROOT STABILIZATION V1"
  echo
  echo "Status: GENERATED"
  echo "Category: API Build Stabilization"
  echo "Date: $(date +%F)"
  echo
  echo "## Purpose"
  echo
  echo "Stabilize apps/api before continuing shared contract adoption."
  echo
  echo "## Rule"
  echo
  echo "Do not migrate shared contracts into API while unrelated TypeScript failures remain active."
  echo
  echo "## Total TypeScript Errors"
  echo
  echo "$ERROR_COUNT"
  echo
  echo "## Error Count By File"
  echo
  echo '```txt'
  grep "error TS" "$LOG" | cut -d: -f1 | sort | uniq -c | sort -nr || true
  echo '```'
  echo
  echo "## Error Domains"
  echo
  echo '```txt'
  grep "error TS" "$LOG" | sed 's#^apps/api/src/##' | sed 's#^src/##' | cut -d/ -f1-2 | sort | uniq -c | sort -nr || true
  echo '```'
  echo
  echo "## Full Error List"
  echo
  echo '```txt'
  grep "error TS" "$LOG" || true
  echo '```'
  echo
  echo "## Root Decision"
  echo
  if [ "$ERROR_COUNT" -gt 10 ]; then
    echo "API shared contract migration is BLOCKED until API build errors are reduced below 10."
  else
    echo "API shared contract migration may continue after remaining errors are reviewed."
  fi
  echo
  echo "END"
} > "$REPORT"

cp "$REPORT" "$LIB_REPORT"

if [ -x /lvtp-data/moni/scripts/moni-library-indexer.sh ]; then
  /lvtp-data/moni/scripts/moni-library-indexer.sh
fi

echo "Generated:"
ls -lh "$REPORT"
ls -lh "$LIB_REPORT"
echo "Local log:"
ls -lh "$LOG"

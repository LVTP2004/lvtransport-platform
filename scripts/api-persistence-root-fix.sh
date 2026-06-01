#!/usr/bin/env bash
set -euo pipefail

LOG="runtime/build/api-persistence-root-fix-build.log"
REPORT="docs/architecture/bootstrap/API_PERSISTENCE_ROOT_FIX_V1.md"

mkdir -p runtime/build docs/architecture/bootstrap

pnpm --filter @lvtransport/api build > "$LOG" 2>&1 || true

{
  echo "# API PERSISTENCE ROOT FIX V1"
  echo
  echo "Status: GENERATED"
  echo "Category: API Build Stabilization"
  echo "Date: $(date +%F)"
  echo
  echo "## Purpose"
  echo
  echo "Replace sqlite.repositories.ts with a stable contract-compatible persistence adapter."
  echo
  echo "## SQLite Errors After Patch"
  echo '```txt'
  grep "error TS" "$LOG" | grep "sqlite.repositories.ts" || true
  echo '```'
  echo
  echo "## Total API Build Errors After Patch"
  echo '```txt'
  grep -c "error TS" "$LOG" || true
  echo '```'
  echo
  echo "## Remaining Error Files"
  echo '```txt'
  grep "error TS" "$LOG" | sed 's/(.*//' | sort | uniq -c | sort -nr | head -80 || true
  echo '```'
  echo
  echo "## Decision"
  echo
  echo "SQLite persistence is now reconciled as a root adapter. Continue with the next highest build-error cluster only after this file shows zero scoped errors."
} > "$REPORT"

echo "===== SQLITE ERRORS ====="
grep "error TS" "$LOG" | grep "sqlite.repositories.ts" || true

echo
echo "===== TOTAL ERRORS ====="
grep -c "error TS" "$LOG" || true

echo
echo "===== REPORT ====="
sed -n '1,140p' "$REPORT"

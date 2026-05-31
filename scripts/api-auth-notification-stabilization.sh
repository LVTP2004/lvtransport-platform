#!/usr/bin/env bash
set -euo pipefail

REPORT="docs/architecture/bootstrap/API_AUTH_NOTIFICATION_STABILIZATION_V1.md"
LOG="runtime/build/api-auth-notification-build.log"

mkdir -p docs/architecture/bootstrap runtime/build

pnpm --filter @lvtransport/api build > "$LOG" 2>&1 || true

{
  echo "# API AUTH NOTIFICATION STABILIZATION V1"
  echo
  echo "Status: GENERATED"
  echo "Category: API Build Stabilization"
  echo "Date: $(date +%F)"
  echo
  echo "## Purpose"
  echo
  echo "Stabilize the currently dirty API auth and notification area before continuing shared contract adoption."
  echo
  echo "## Dirty Files In Scope"
  echo
  echo '```txt'
  git status --short \
    | grep -E "apps/api/(package.json|src/auth|src/notifications)|packages/auth|pnpm-lock.yaml" || true
  echo '```'
  echo
  echo "## Current Build Errors In Scope"
  echo
  echo '```txt'
  grep "error TS" "$LOG" \
    | grep -E "src/auth|src/notifications|packages/auth|notification" || true
  echo '```'
  echo
  echo "## Total API Build Errors"
  echo
  echo '```txt'
  grep -c "error TS" "$LOG" || true
  echo '```'
  echo
  echo "## Error Count By File"
  echo
  echo '```txt'
  grep "error TS" "$LOG" | cut -d: -f1 | sort | uniq -c | sort -nr || true
  echo '```'
  echo
  echo "## Decision"
  echo
  echo "Fix auth and notification build blockers first. Do not continue API shared contract adoption until this scoped area is clean or intentionally reverted."
  echo
  echo "END"
} > "$REPORT"

echo "Generated:"
echo "$REPORT"
echo "$LOG"

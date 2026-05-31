#!/usr/bin/env bash
set -euo pipefail

REPORT="docs/architecture/bootstrap/API_SQLITE_PERSISTENCE_AUDIT_V1.md"
LOG="runtime/build/api-sqlite-persistence-build.log"

pnpm --filter @lvtransport/api build > "$LOG" 2>&1 || true

{
  echo "# API SQLITE PERSISTENCE AUDIT V1"
  echo
  echo "Status: GENERATED"
  echo "Category: API Build Stabilization"
  echo "Date: $(date +%F)"
  echo
  echo "## SQLite Errors"
  echo
  echo '```txt'
  grep "error TS" "$LOG" | grep "sqlite.repositories.ts" || true
  echo '```'
  echo
  echo "## SQLite Repository Section"
  echo
  echo '```ts'
  sed -n '1,180p' apps/api/src/modules/persistence/sqlite.repositories.ts
  echo '```'
  echo
  echo "## Persistence Contract Definitions"
  echo
  echo '```ts'
  grep -R "NotificationAttemptRecord\|MessageEventRecord\|AuditEventRecord\|RecoveryEventRecord" \
    apps/api/src/modules/persistence apps/api/src/persistence packages \
    -n || true
  echo '```'
  echo
  echo "## Decision"
  echo
  echo "Patch sqlite.repositories.ts against the declared persistence contracts, not against downstream route usage."
  echo
  echo "END"
} > "$REPORT"

echo "Generated:"
echo "$REPORT"
echo "$LOG"

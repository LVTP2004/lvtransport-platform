#!/usr/bin/env bash
set -e
cd ~/lvtransport-platform

mkdir -p ops/reports

pnpm --filter @lvtransport/web build 2>&1 | tee ops/reports/latest-build.log || true

{
  echo "# Contract Audit"
  date
  echo
  echo "## Top TS errors"
  grep -E "error TS[0-9]+:" ops/reports/latest-build.log \
    | sed -E 's/^([^:]+:[0-9]+:[0-9]+).*error (TS[0-9]+):.*/\2 \1/' \
    | sort | uniq -c | sort -nr | head -50 || true

  echo
  echo "## Files with most errors"
  grep -E "^[^ ]+\.tsx?:[0-9]+:[0-9]+ - error" ops/reports/latest-build.log \
    | cut -d: -f1 | sort | uniq -c | sort -nr | head -30 || true

  echo
  echo "## Duplicate identifiers"
  grep -E "Duplicate identifier|already exported|no exported member|not assignable" ops/reports/latest-build.log || true
} > ops/reports/contract-audit.md

cat ops/reports/contract-audit.md

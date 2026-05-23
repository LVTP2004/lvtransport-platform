#!/usr/bin/env bash
cd ~/lvtransport-platform
REPORT="ops/reports/ts-scout.md"
{
echo "# TypeScript Scout Report"
date
echo ""
pnpm install --no-frozen-lockfile
echo ""
echo "## Web build"
pnpm --filter @lvtransport/web build
echo ""
echo "## API build"
pnpm --filter @lvtransport/api build
} 2>&1 | tee "$REPORT"

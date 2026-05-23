#!/usr/bin/env bash
set -e

cd ~/lvtransport-platform

REPORT="ops/reports/final-repair-report.md"
mkdir -p ops/reports

{
echo "# Final Repair Report"
date
echo
echo "## Git"
git status
git branch --show-current
echo
echo "## Install"
pnpm install --no-frozen-lockfile
echo
echo "## Web Build"
pnpm --filter @lvtransport/web build
echo
echo "## API Build"
pnpm --filter @lvtransport/api build || true
echo
echo "## PM2"
pm2 status
echo
echo "## Nginx"
sudo nginx -t
echo
echo "## HTTP"
curl -I http://lvtransport.be || true
} 2>&1 | tee "$REPORT"

#!/usr/bin/env bash
cd ~/lvtransport-platform
REPORT="ops/reports/build-scout.md"
{
echo "# Build Scout Report"
date
echo ""
echo "## Git"
git branch --show-current
git status --short
echo ""
echo "## Package scripts"
cat package.json
echo ""
echo "## PM2"
pm2 status
echo ""
echo "## Ports"
sudo ss -tulpn | grep -E ':80|:3000|:3010|:3100' || true
echo ""
echo "## Nginx"
sudo nginx -t
echo ""
echo "## Domain"
curl -I http://lvtransport.be || true
} 2>&1 | tee "$REPORT"

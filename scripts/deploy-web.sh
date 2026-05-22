#!/usr/bin/env bash
set -euo pipefail

cd ~/lvtransport-platform/apps/web
npm run build

sudo rm -rf /var/www/lvtransport-ops/*
sudo cp -r dist/* /var/www/lvtransport-ops/

sudo nginx -t
sudo systemctl reload nginx

echo "✅ web deployed"

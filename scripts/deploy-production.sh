#!/usr/bin/env bash
set -euo pipefail

: "${WEB_ROOT:=/var/www/lvtp-app}"
: "${ADMIN_ROOT:=/var/www/lvtp-admin}"
: "${DRIVER_ROOT:=/var/www/lvtp-driver}"

echo "[1/6] Installing dependencies"
pnpm install --frozen-lockfile

echo "[2/6] Building workspaces"
pnpm build

echo "[3/6] Syncing web/admin/driver dist"
rsync -av --delete apps/web/dist/ "$WEB_ROOT/"
rsync -av --delete apps/admin/dist/ "$ADMIN_ROOT/"
rsync -av --delete apps/driver/dist/ "$DRIVER_ROOT/"

echo "[4/6] Reloading PM2 API process"
pm2 reload ecosystem.config.cjs --only lvtransport-api || true

echo "[5/6] Validating and reloading Nginx"
nginx -t
systemctl reload nginx

echo "[6/6] Done. Verify: / /booking /tracking /moni /moni-ride /app /admin /driver /dashboard"

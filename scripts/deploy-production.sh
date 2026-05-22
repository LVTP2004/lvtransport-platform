#!/usr/bin/env bash
set -euo pipefail

: "${WEB_ROOT:=/var/www/lvtp-app}"
: "${ADMIN_ROOT:=/var/www/lvtp-admin}"
: "${DRIVER_ROOT:=/var/www/lvtp-driver}"
: "${API_HEALTHCHECK_URL:=http://127.0.0.1:3000/health}"
: "${PM2_APP_NAME:=lvtransport-api}"

echo "[1/8] Installing dependencies"
pnpm install --frozen-lockfile

echo "[2/8] Building workspaces"
pnpm build

echo "[3/8] Creating deployment roots"
mkdir -p "$WEB_ROOT" "$ADMIN_ROOT" "$DRIVER_ROOT"

echo "[4/8] Syncing web/admin/driver dist (authoritative production builds)"
rsync -av --delete apps/web/dist/ "$WEB_ROOT/"
rsync -av --delete apps/admin/dist/ "$ADMIN_ROOT/"
rsync -av --delete apps/driver/dist/ "$DRIVER_ROOT/"

echo "[5/8] Removing known legacy deployment leftovers"
find "$WEB_ROOT" "$ADMIN_ROOT" "$DRIVER_ROOT" -maxdepth 2 -type f \
  \( -name '*demo*' -o -name '*legacy*' -o -name '*backup*' -o -name '*copy*' \) -print -delete || true

echo "[6/8] Reloading PM2 API process"
pm2 reload ecosystem.config.cjs --only "$PM2_APP_NAME" || true

echo "[7/8] Validating and reloading Nginx"
nginx -t
systemctl reload nginx

echo "[8/8] API sanity healthcheck"
if command -v curl >/dev/null 2>&1; then
  curl -fsS "$API_HEALTHCHECK_URL" >/dev/null && echo "Healthcheck OK: $API_HEALTHCHECK_URL" || echo "Healthcheck warning: $API_HEALTHCHECK_URL"
fi

echo "Done. Verify routes: / /booking /tracking /moni /moni-ride /app /admin /driver /dashboard"

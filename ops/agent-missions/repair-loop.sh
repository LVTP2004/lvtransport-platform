#!/usr/bin/env bash
set -e

cd ~/lvtransport-platform

REPORT="ops/reports/autonomous-final-repair.md"

mkdir -p ops/reports

while true
do

echo "===== AUTONOMOUS REPAIR ====="

{
date

echo "===== GIT ====="
git status

echo "===== FIX PACKAGE JSON ====="
python3 - <<'PY'
import json
from pathlib import Path

p = Path("package.json")

raw = p.read_text()

raw = raw.replace(',\n}', '\n}')
raw = raw.replace(',\n]', '\n]')

obj = json.loads(raw)

p.write_text(json.dumps(obj, indent=2))
print("package.json repaired")
PY

echo "===== INSTALL ====="
pnpm install --no-frozen-lockfile || true

echo "===== BUILD WEB ====="
pnpm --filter @lvtransport/web build || true

echo "===== BUILD API ====="
pnpm --filter @lvtransport/api build || true

echo "===== PM2 ====="
pm2 status || true

echo "===== NGINX ====="
sudo nginx -t || true

echo "===== DOMAIN ====="
curl -I http://lvtransport.be || true

} 2>&1 | tee "$REPORT"

sleep 20

done

#!/bin/bash
set -euo pipefail

cd /home/ubuntu/lvtransport-platform

git fetch --all --prune
git checkout main
git reset --hard origin/main
pnpm install --frozen-lockfile
pnpm --filter @lvtransport/api build
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

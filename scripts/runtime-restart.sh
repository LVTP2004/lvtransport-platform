#!/usr/bin/env bash

set -euo pipefail

pm2 restart lvtransport-memory-api
pm2 save

sudo systemctl restart nginx

echo "✅ operational runtime restarted"

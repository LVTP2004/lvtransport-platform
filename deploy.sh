#!/bin/bash
set -e

cd /home/ubuntu/lvtransport-platform

git pull origin main
pnpm install
pm2 restart lvtransport-web
pm2 restart lvtransport-api
pm2 save

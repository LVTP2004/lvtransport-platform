#!/bin/bash

set -e

echo "=== LVTRANSPORT PRODUCTION DEPLOY ==="

PROJECT_DIR="/home/ubuntu/lvtransport-platform"
DIST_DIR="$PROJECT_DIR/apps/web/dist"
PROD_DIR="/var/www/lvtransport-web"

echo "=== BUILDING FRONTEND ==="
cd $PROJECT_DIR

pnpm --filter @lvtransport/web build

echo "=== CLEANING OLD PRODUCTION FILES ==="
sudo rm -rf $PROD_DIR/*

echo "=== COPYING NEW BUILD ==="
sudo cp -r $DIST_DIR/* $PROD_DIR/

echo "=== FIXING PERMISSIONS ==="
sudo chown -R www-data:www-data $PROD_DIR
sudo chmod -R 755 $PROD_DIR

echo "=== TESTING NGINX ==="
sudo nginx -t

echo "=== RELOADING NGINX ==="
sudo systemctl reload nginx

echo "=== DEPLOY COMPLETE ==="

curl -I https://lvtransport.be

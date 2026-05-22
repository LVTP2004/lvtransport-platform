#!/usr/bin/env bash

echo ""
echo "==== PM2 ===="
pm2 status

echo ""
echo "==== MEMORY API ===="
curl -s http://127.0.0.1:8787/health

echo ""
echo ""
echo "==== NGINX ===="
sudo systemctl status nginx --no-pager | head -20

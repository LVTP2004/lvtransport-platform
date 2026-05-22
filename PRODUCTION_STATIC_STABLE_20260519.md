# LV Transport - Production Static Stable

Date: 2026-05-19

## Status
LV Transport frontend is now served as static production build via nginx.

## Current Production Flow
pnpm build
-> apps/web/dist
-> /var/www/lvtransport-web
-> nginx
-> https://lvtransport.be

## Confirmed
- HTTPS: OK
- nginx: OK
- static assets: OK
- Vite DEV runtime: removed from production
- PM2 lvtransport frontend: stopped
- lvtransport-api: online
- deploy script: scripts/deploy/deploy-production.sh
- snapshot: backups-lvtransport/stable-20260519

## Notes
app.lvtransport.be is temporarily set to reconstruction placeholder.

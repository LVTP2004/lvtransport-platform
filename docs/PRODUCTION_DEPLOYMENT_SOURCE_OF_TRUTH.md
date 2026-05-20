# LVTP Production Deployment Source of Truth (2026-05-14)

## What should be deployed
- Customer app: `apps/web/dist`
- Admin app: `apps/admin/dist`
- Driver app: `apps/driver/dist`
- API process: PM2 app `lvtransport-api` from `ecosystem.config.cjs`

## Public routes that must resolve
- `/`, `/booking`, `/tracking`, `/moni`, `/moni-ride`, `/admin`, `/driver`, `/app`, `/dashboard`
- `/api/v1/health` (API health)

## Hosting patterns supported
1. **VPS + Nginx (recommended)**
   - Nginx static root points to latest synced dist directory.
   - Use SPA fallback: `try_files $uri $uri/ /index.html;`
2. **OVH static hosting (legacy fallback)**
   - Upload only current `apps/web/dist` artifacts.
   - Old `/www` files must be deleted to avoid stale page serving.

## Why features can appear missing
- Built artifacts not copied to Nginx/OVH public root.
- Old `/www` or old dist files still served.
- `.html` aliases present but not mapped in app route resolver.
- Missing map API key causing blank map if no fallback UI.

## Deployment command (VPS)
```bash
./scripts/deploy-production.sh
```

## Cache busting
- Vite emits hashed asset names in `dist/assets/*`.
- Always deploy with `rsync --delete` to remove old hashes.
- For mobile hard refresh: open `https://lvtransport.be/?v=2026-05-14-1` once after deploy.

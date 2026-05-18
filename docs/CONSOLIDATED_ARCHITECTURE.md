# Consolidated Architecture (lvtransport.be)

## Operational topology

- **Frontend delivery**: Nginx serves static assets only (no Vite preview runtime in production).
- **Backend API**: Separate service in `/var/www/lvtransport-api`, listening on `127.0.0.1:3000`.
- **PM2 scope**: PM2 should manage only `lvtransport-api`.
- **API domain**: `api.lvtransport.be` proxies to `http://127.0.0.1:3000`.
- **Primary frontend domains**: `lvtransport.be`, `www.lvtransport.be`, `app.lvtransport.be`.
- **Expected static root**: `/var/www/lvtransport-platform/lvtransport-platform/apps/web/dist`.
- **Admin static app**: `admin.lvtransport.be` serves `apps/admin/dist`.
- **Driver static app**: `driver.lvtransport.be` serves `apps/driver/dist`.

## Production constraints

- Port **4173** is not valid for production serving.
- `vite preview`, `pnpm preview`, and `npm run preview` are considered zombie runtime processes in production.
- The new frontend candidate lives in `apps/web-consolidated-grey` and is isolated from current production.

## Quarantine policy

- Keep archived server content in quarantine folders, such as:
  - `/var/www/_QUARANTINE_20260518_0625`
  - `/var/www/_QUARANTINE_20260518_0628`
  - `/var/www/_QUARANTINE_ZOMBIE_...`
- Do not perform irreversible deletes during consolidation; move unknown assets to quarantine first.

## Recommended deploy workflow

```bash
cd /var/www/lvtransport-platform/lvtransport-platform
git pull
pnpm install
pnpm --filter @lvtransport/web-consolidated-grey build
```

Then choose one controlled path:
1. Keep production on `apps/web` and validate `apps/web-consolidated-grey/dist` in staging first.
2. Merge selected UI changes from `apps/web-consolidated-grey` into `apps/web` in a dedicated release PR.

## Rollback strategy

1. Keep previous static `dist` backup before any switch.
2. If deployment fails, restore the last known good `dist` and reload Nginx.
3. Preserve any replaced assets in quarantine instead of deleting.
4. Never rollback by starting `vite preview`; rollback must remain static + Nginx.

## Legacy candidates to archive later (no deletion in this step)

Candidate paths for future archive review:
- `apps/eats`
- `apps/ride`
- `apps/main-web`
- `packages/moni-assistent`
- `runtime-reports`
- `current-site`

These should be reviewed and moved to `archive/legacy` (or documented in a legacy map) only after business sign-off.

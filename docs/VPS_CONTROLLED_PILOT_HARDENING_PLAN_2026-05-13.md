# LV Transport Platform — VPS Controlled Pilot Hardening Plan (2026-05-13)

## Scope / Guardrails
- No new business features.
- No UI redesign.
- Preserve lifecycle/orchestration model validated in recent reports.
- Preserve premium LV Transport branding.
- Preserve separation between OVH static files and VPS runtime artifacts.

## Current Readiness Snapshot
**Deployment readiness: 83%**

Readiness was scored against runtime, routing, env management, operational safety, and pilot verification evidence.

## 1) VPS Runtime Readiness

### 1.1 Node + PNPM compatibility
- Workspace is pinned to `pnpm@9.15.0` at root. VPS must install PNPM 9.x to avoid lockfile/tooling drift.
- API/backend compiles with TypeScript and runs from `dist/server.js`.
- Frontend surfaces (`web`, `admin`, `driver`) use Vite 5 + TS build pipeline.

**Required VPS baseline**
- Node.js: 22 LTS (recommended; repository uses `@types/node` 22.x and modern ESM/TS tooling).
- PNPM: 9.15.x (or latest 9.x compatible).

### 1.2 PM2 process configuration
Current PM2 file contains only API process and healthy restart options.

**Current strengths**
- `autorestart`, bounded restart count, minimum uptime gate, exponential backoff.
- `NODE_ENV=production` set in PM2 env.

**Hardening actions required**
1. Keep API process as authoritative backend process.
2. Add explicit log file paths + merge behavior (or install `pm2-logrotate`).
3. Add `max_memory_restart` threshold (e.g., `400M`) to prevent silent OOM loops.
4. Add separate PM2 app entries only if serving frontend previews from Node (not recommended for production static hosting behind Nginx).

### 1.3 API startup command (production)
- Build: `pnpm --filter @lvtransport/api build`
- Start: `pnpm --filter @lvtransport/api start`
- Runtime target: `node dist/server.js`

### 1.4 Frontend build commands
- Web customer app: `pnpm --filter @lvtransport/web build`
- Admin surface: `pnpm --filter @lvtransport/admin build`
- Driver surface: `pnpm --filter @lvtransport/driver build`

### 1.5 Port mapping
- API listens on `PORT` (default 4000).
- Frontend dist artifacts should be served by Nginx as static files (recommended) on 443 virtual hosts.

### 1.6 Restart behavior
- Keep PM2 autorestart + backoff.
- Use `pm2 startOrReload ecosystem.config.cjs --update-env` for zero/low-downtime API reloads.
- Persist startup: `pm2 startup` + `pm2 save`.

## 2) Nginx / Domain Routing

## Intended routing (production)
- `lvtransport.be` → redirect to `https://app.lvtransport.be` (or serve marketing shell if intentionally hosted elsewhere).
- `api.lvtransport.be` → reverse proxy to VPS API upstream (`127.0.0.1:4000`).
- `admin.lvtransport.be` → static root for `apps/admin/dist` build.
- `driver.lvtransport.be` → static root for `apps/driver/dist` build.
- `app.lvtransport.be` → static root for `apps/web/dist` build.

## Reverse proxy target confirmation
- Only API requires reverse proxy upstream to Node (`127.0.0.1:4000`).
- Web/admin/driver should be direct Nginx static roots (no PM2 for static apps).

## Missing SSL/domain steps
1. DNS A/AAAA records for all five hostnames to VPS IP.
2. Issue certs for all SANs (Let’s Encrypt via certbot or acme.sh).
3. Enforce HTTPS redirect on every host.
4. Add renewal check (`systemctl timer`/certbot renew cron + test dry-run).

## OVH static separation control
- Keep OVH legacy/static bundle outside VPS deploy directory; do not rsync/merge with app runtime paths.
- Use dedicated VPS directories:
  - `/var/www/lvtp-app`
  - `/var/www/lvtp-admin`
  - `/var/www/lvtp-driver`
- Never copy `current-site/*` archive into these live roots.

## 3) Environment Configuration

## 3.1 Required environment variables

### API runtime (server-side)
- `NODE_ENV=production`
- `PORT=4000` (or internal alternative)
- `CORS_ORIGIN=https://app.lvtransport.be,https://admin.lvtransport.be,https://driver.lvtransport.be`
- `APP_NAME=lvtransport-api`
- `GOOGLE_MAPS_API_KEY=<prod-key>` (**required in prod by runtime guard**)
- `JWT_SECRET=<strong-secret>` (**required operationally; currently has insecure dev fallback if omitted**)
- `TRUST_PROXY=true` (when behind Nginx)
- Optional integrations (if enabled):
  - `STRIPE_SECRET_KEY`
  - `PAYCONIQ_API_KEY`
  - `MAIL_PROVIDER_API_KEY`
  - `MAIL_FROM_ADDRESS`
- Firebase shared architecture:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_DATABASE_URL`
  - `FIREBASE_USE_EMULATORS=false` in production

### Frontend runtime/build-time (Vite)
(applies to web/admin/driver as needed)
- `VITE_API_BASE_URL=https://api.lvtransport.be/api/v1`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_USE_EMULATORS=false`

## 3.2 Missing secrets / gaps to close
- `JWT_SECRET` is not enforced by startup guard; must be made mandatory in deployment checklist.
- `.env.example` files lacked `VITE_API_BASE_URL` and several production-oriented keys; now documented and added.

## 3.3 Environment separation
- Maintain separate `.env.production`, `.env.staging`, `.env.local` values.
- Never reuse staging secrets in production.

## 3.4 Secret hygiene
- Keep secrets in VPS environment files with restricted permissions (`chmod 600`).
- Do not commit `.env.production`.

## 4) Operational Safety

## 4.1 Health checks
- HTTP health endpoint: `GET /api/v1/health` (and/or configured health route variants).
- Add Nginx upstream health probe script for preflight.

## 4.2 Logs
- PM2 logs for API (`pm2 logs lvtransport-api`).
- Nginx access/error logs per vhost.
- Keep booking ID visibility in operational logs for incident tracing.

## 4.3 PM2 restart policy baseline
- `autorestart: true`
- `max_restarts: 10`
- `min_uptime: 15s`
- `exp_backoff_restart_delay: 200`
- add `max_memory_restart`.

## 4.4 Basic backup plan
- Nightly database backup (managed DB snapshot or `pg_dump` equivalent).
- Daily backup of:
  - API `.env.production`
  - Nginx vhost configs
  - PM2 ecosystem config
- Retention: minimum 14 days for pilot.

## 4.5 Rollback plan
1. Put platform in controlled intake pause (stop new bookings).
2. Checkout previous known-good git commit/tag.
3. Rebuild API + static surfaces.
4. `pm2 startOrReload ecosystem.config.cjs --update-env`.
5. Reload Nginx if static path symlink changed.
6. Run smoke checks before reopening intake.

## 4.6 Error visibility / observability access
- Founder operator must have direct access to:
  - PM2 process status
  - PM2 logs
  - Nginx error logs
  - operational validation reports in `/docs`

## 5) Controlled Pilot Deployment Checklist (Exact)

## Pre-deploy
- [ ] Confirm Node 22.x and PNPM 9.15.x installed.
- [ ] Pull release commit.
- [ ] Install dependencies with lockfile.
- [ ] Prepare production env files (API + Vite per surface).
- [ ] Build API and all 3 frontend surfaces.

## Deploy API
- [ ] Start/reload PM2 API process.
- [ ] Confirm API process is online and stable for 2+ minutes.
- [ ] Verify `https://api.lvtransport.be/api/v1/health`.

## Deploy frontends
- [ ] Publish `apps/web/dist` to app vhost root.
- [ ] Publish `apps/admin/dist` to admin vhost root.
- [ ] Publish `apps/driver/dist` to driver vhost root.
- [ ] Reload Nginx.

## Functional pilot checks
- [ ] Create booking from customer surface.
- [ ] Verify booking appears in admin/control tower.
- [ ] Assign driver and confirm acknowledgment.
- [ ] Progress lifecycle statuses to completion.
- [ ] Verify realtime synchronization customer ↔ driver ↔ admin.
- [ ] Verify logs capture timeline/events for tested booking ID.

## 6) Risk Classification

### Blocker
1. Missing production secrets (`GOOGLE_MAPS_API_KEY`, `JWT_SECRET`, Firebase production values).
2. DNS/SSL not fully active for all required domains.

### High
1. CORS misconfiguration across multi-subdomain deployment.
2. Incomplete API/frontend env alignment (`VITE_API_BASE_URL`, emulator flags).
3. No validated rollback rehearsal on VPS.

### Medium
1. Missing memory restart threshold in PM2.
2. Missing formalized backup restore drill evidence.
3. Missing centralized log retention policy enforcement.

### Low
1. Legacy duplicate env keys in examples causing operator confusion.
2. Domain root redirect decision (`lvtransport.be`) not finalized.

## 7) PM2 Process Plan
- Keep PM2 managing **API only** for pilot.
- Static surfaces served directly by Nginx.
- Recommended process definition enhancements:
  - add `max_memory_restart`
  - optional `out_file` / `error_file`
  - ensure startup persistence (`pm2 save`).

## 8) Nginx/Domain Routing Recommendations
1. One vhost per domain (5 total).
2. API vhost reverse proxy to `127.0.0.1:4000` with websocket headers.
3. App/admin/driver vhosts static file serving with SPA fallback (`try_files ... /index.html`).
4. Strict HTTPS and HSTS.
5. Keep OVH static artifacts physically isolated from VPS service directories.

## 9) Remaining Blockers
1. Production secret provisioning and validation not yet evidenced.
2. Full DNS + TLS issuance/renewal verification not yet evidenced.
3. Rollback execution drill not yet evidenced.

## 10) GO / NO-GO Recommendation
**Recommendation: CONDITIONAL GO** for controlled founder-operated VPS pilot **only after blocker closure**.

- If blockers are closed and checklist passes end-to-end: **GO**.
- If any blocker remains at launch time: **NO-GO**.


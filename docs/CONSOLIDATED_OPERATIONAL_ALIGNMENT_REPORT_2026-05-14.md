# Consolidated Operational Alignment Report — 2026-05-14

## Scope and execution boundary
This consolidation pass aligns repository-controlled infrastructure and operational artifacts.
Direct VPS runtime verification (live Nginx/PM2 processes, host boot, domain DNS) must be executed on the target server.

## 1) Current infrastructure map
- Monorepo workspace with API + web + admin + driver applications.
- Deployment model: static frontend apps via Nginx roots, API via PM2 + reverse proxy.
- Source-of-truth Nginx vhost created at `deploy/nginx/lvtransport.conf`.
- Source-of-truth PM2 app remains `lvtransport-api` in `ecosystem.config.cjs`.

## 2) Active services map
Intended production services:
- `lvtransport-api` (PM2 managed Node process).
- Nginx public ingress.
- Static web roots:
  - `/var/www/lvtp-app`
  - `/var/www/lvtp-admin`
  - `/var/www/lvtp-driver`

## 3) Nginx routing structure
Consolidated host mapping:
- `lvtransport.be`, `www.lvtransport.be` → `/var/www/lvtp-app`
- `api.lvtransport.be` → `127.0.0.1:4000` (includes `/ws` upgrade headers)
- `admin.lvtransport.be` → `/var/www/lvtp-admin`
- `driver.lvtransport.be`, `app.lvtransport.be` → `/var/www/lvtp-driver`

## 4) Frontend/backend separation structure
- Frontends are static artifacts served directly by Nginx.
- Backend is isolated in PM2 and consumed through `api.lvtransport.be`.
- Websocket lifecycle traffic shares the API host and proxy upstream.

## 5) Operational lifecycle explanation
- Booking lifecycle and guardrails remain centralized in API services and lifecycle/realtime orchestration modules.
- Terminal state immutability and invalid transition rejection continue to be enforced in service-level lifecycle logic.
- Read models and realtime propagation are converged through shared orchestrator services.

## 6) Realtime synchronization explanation
- `/ws` upgrades are explicitly forwarded by Nginx in consolidated config.
- API orchestrator remains authoritative for lifecycle broadcasting and replay/snapshot behavior.
- Expected consistency model: customer/admin/driver clients converge to latest valid server state.

## 7) Remaining fragmentation points
- Live VPS may still contain duplicate legacy site files outside this repository.
- DNS/TLS issuance and cert references are host-managed and not represented in repo.
- PM2 startup hook (`pm2 startup`) and post-reboot resurrection require host-side closure evidence.

## 8) Production readiness evaluation
Status: **conditional readiness**.
- Repo-level deployment/routing defaults are now aligned.
- Final readiness requires host execution evidence for:
  - `nginx -t`
  - PM2 restart persistence
  - reboot recovery
  - end-to-end domain routing validation

## 9) Founder-operator readiness evaluation
Status: **operationally viable for controlled founder-led pilot** after host checklist closure.
- Alignment reduces config drift risk and conflicting host-routing definitions.
- Runtime rehearsal remains mandatory for continuity confidence.

## 10) Recommended next milestone
**Milestone:** VPS execution closure + incident drill certification.
1. Install consolidated vhost as single enabled config.
2. Archive and disable old/conflicting site definitions.
3. Run `scripts/ops/infra-alignment-check.sh` on VPS.
4. Execute live booking during PM2 restart + reconnect drill.
5. Record artifacts in dated operations log and certify GO/NO-GO.

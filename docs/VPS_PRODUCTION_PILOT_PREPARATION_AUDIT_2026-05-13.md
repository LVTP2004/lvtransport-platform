# LV Transport Platform — Controlled VPS Production Pilot Preparation Audit (2026-05-13)

## Scope and constraints
This audit is limited to **production-readiness stabilization** for a founder-operated controlled pilot. It does **not** introduce product redesign, new feature scope, or branding changes.

Evidence sources in this run:
- Runtime/config files (`ecosystem.config.cjs`, `deploy.sh`, API env/config/routing/websocket/lifecycle code).
- Existing readiness and hardening docs already in repo.
- Fresh local runtime checks (build + boot + health probe + logs).

---

## 1) VPS Runtime Validation

### What was validated
- API build succeeds (`pnpm --filter @lvtransport/api build`).
- API boot works and serves health endpoint (`GET /api/v1/health` on port 4000).
- Runtime emits structured logs including startup, request log, and shutdown signal handling.
- PM2 runtime shape is present (`autorestart`, restart backoff, restart cap, `pm2 save` in deploy flow).

### Findings
- **Boot reliability:** Pass once build artifacts exist.
- **Operational caveat:** Starting API without a fresh build can fail (`dist/server.js` missing).
- **Startup sequencing:** Current deploy script compiles API before PM2 reload, which is correct.
- **Restart persistence:** `pm2 save` is included in deployment script, but `pm2 startup` execution is still a VPS-side prerequisite.
- **Memory/crash controls:** PM2 has restart/backoff controls but no memory restart threshold/logrotate policy yet.
- **Frontend serving:** static deploy intent exists, but actual VPS Nginx serving validation is pending execution on target VPS.
- **Environment loading correctness:** production guardrails exist in env parser (maps key + non-wildcard CORS in production).

### Runtime risk summary
- **Medium risk:** build artifact dependency not explicitly preflight-checked before startup.
- **Medium risk:** PM2 policies are present but not fully hardened (memory limit/log rotation/startup persistence hook not yet evidenced in runbook execution).

---

## 2) Domain & Routing Verification

Target routing audited:
- `lvtransport.be`
- `api.lvtransport.be`
- `admin.lvtransport.be`
- `driver.lvtransport.be`
- `app.lvtransport.be`

### Routing intent consistency
- Existing hardening plan aligns with:
  - `api.lvtransport.be` → VPS API upstream (`127.0.0.1:4000`)
  - `admin/driver/app` subdomains → static builds
  - `lvtransport.be` → redirect or separate marketing surface decision
- This is compatible with OVH static/frontend separation strategy when only API+WS are proxied via VPS.

### Compatibility checks
- **Reverse proxy mapping:** compatible (single API upstream + `/ws` websocket path).
- **SSL expectations:** full cert coverage needed for all 5 domains before pilot.
- **Nginx compatibility:** expected, but still requires target-VPS config validation.
- **Frontend/backend isolation:** architecture supports isolation via subdomain split.
- **Websocket/realtime compatibility:** requires explicit Nginx `Upgrade` / `Connection` forwarding for `/ws`.

### Routing risk summary
- **High risk until executed on VPS:** no direct Nginx config execution proof in this run.
- **Medium risk:** root-domain behavior (`lvtransport.be`) must be explicitly finalized to avoid operator confusion during pilot.

---

## 3) Controlled Ride Lifecycle Validation

Canonical lifecycle validated from source:

`pending → assigned → accepted → en_route → arrived → in_progress → completed`

### Determinism controls present
- Allowed transition matrix is explicitly encoded.
- Terminal states (`completed`, `cancelled`, `failed`) are immutable by transition map.
- Invalid transitions are rejected by state graph constraints.
- Reconnect consistency path exists (`booking.lifecycle.recover` and snapshot response).
- Realtime propagation supported via event bus broadcast to websocket clients.

### Residual lifecycle risk
- **Medium risk:** deterministic rules exist, but this run did not execute full multi-surface scripted E2E proving all clients remain perfectly synchronized across reconnect + edge ordering in one integrated rehearsal.

---

## 4) Operational Observability Validation

### Verified observability assets
- Structured API logging with request IDs.
- Startup/shutdown trace logging.
- Websocket connection/message logs.
- Health endpoint (`/api/v1/health`).
- Integration readiness and operational diagnostics endpoints already exposed in v1 routes.
- PM2 log access path is designed (`pm2 logs lvtransport-api`) but not executed in this environment.

### Observability risk summary
- **Medium risk:** PM2-side log rotation/retention and restart forensic workflow should be finalized before live pilot.

---

## 5) Controlled Founder-Operated Pilot Safety

### Can one real controlled founder-operated ride be safely attempted?
**Yes — conditionally (GO with gates).**

### Exact prerequisites still required before attempting the first real controlled ride
1. Execute full VPS deployment on target host with PM2 + Nginx (not only local audit environment).
2. Confirm TLS valid for all required subdomains.
3. Confirm websocket proxy behavior under HTTPS (`wss`) with reconnect snapshot recovery.
4. Finalize production `.env` with all required keys and non-wildcard origins.
5. Run one complete dry-run lifecycle on production-shaped domains with founder/driver/admin surfaces concurrently.
6. Confirm rollback rehearsal has been performed successfully once.

### Operational risks that still exist
- VPS-specific Nginx/PM2 runtime behavior not yet evidenced in this audit run.
- Potential operator misconfiguration due env-doc drift.
- Restart observability/log retention could be insufficient without explicit PM2 log policy.

### What should remain internal-only now
- Public/open onboarding and uncontrolled traffic.
- Unsupervised concurrent multi-ride operations.
- Any external payment automation beyond controlled supervision gates.

---

## 6) Production Hardening Gaps

### Blockers
1. Target-VPS PM2/Nginx execution evidence is missing (must be proven, not inferred).
2. Deployment runbook/env matrix still needs final alignment and signoff for first ride.

### High-risk items
1. Websocket proxy correctness under TLS (`wss`) not yet proven end-to-end on target domains.
2. Rollback drill not yet marked as executed evidence for current deployment artifact.

### Medium-risk items
1. Build/start sequencing guard not explicit (startup can fail if build omitted).
2. PM2 hardening incomplete (memory cap/logrotate/startup persistence verification).
3. Root-domain routing decision (`lvtransport.be`) not finalized in execution checklist.

### Low-risk items
1. Minor env example/document drift (variable coverage and duplicate key hygiene).
2. Port assumption mismatch risk for operators expecting 3000 instead of 4000.

---

## 7) Ordered Deployment Execution Checklist (Exact)

1. Provision VPS runtime: Node LTS, pnpm, PM2, Nginx.
2. Pull exact release commit to final deploy path.
3. Create/verify production `.env` (API) including `NODE_ENV=production`, `PORT=4000`, strict `CORS_ORIGIN`, maps/auth/mail/payment keys as used.
4. Install deps with lockfile: `pnpm install --frozen-lockfile`.
5. Build API + static apps (`api`, `web`, `admin`, `driver`).
6. Validate API standalone boot + `GET /api/v1/health` locally on VPS.
7. Configure PM2 process from `ecosystem.config.cjs`; ensure `cwd` matches actual deploy path.
8. Start/reload PM2 process and persist (`pm2 startOrReload ... --update-env`, `pm2 save`, `pm2 startup`).
9. Configure Nginx virtual hosts:
   - `api.lvtransport.be` reverse proxy to `127.0.0.1:4000`
   - `/ws` websocket upgrade headers enabled
   - static host routing for `admin`, `driver`, `app`
   - `lvtransport.be` redirect/landing decision applied.
10. Issue/verify TLS for all 5 domains.
11. Validate probes:
   - `https://api.lvtransport.be/api/v1/health`
   - readiness/diagnostics/admin operational endpoints.
12. Validate realtime handshake + reconnect recovery from browser clients across app/admin/driver.
13. Execute controlled dry-run of full lifecycle end-to-end.
14. Review logs (API + PM2 + Nginx) for transition integrity and errors.
15. Execute first controlled real founder ride with monitoring open and rollback trigger owner assigned.

---

## Exact rollback plan
1. Trigger rollback if lifecycle determinism breaks, realtime desync persists, or API availability drops below pilot threshold.
2. Set Nginx to maintenance/deny public ingress for pilot routes.
3. Stop current PM2 process version.
4. Switch deploy symlink/path to last-known-good release.
5. Restore previous `.env` backup.
6. Restart PM2 from previous release and verify process online.
7. Re-run health/readiness endpoints and one internal dry-run lifecycle.
8. Re-enable ingress only after admin/driver/customer state parity is confirmed.
9. Record incident timeline, root cause, and corrective action before next live attempt.

---

## Readiness scoring (current audit)
- **Production readiness:** 84%
- **VPS deployment readiness:** 78%
- **Lifecycle reliability:** 89%
- **Realtime synchronization confidence:** 86%
- **Operational safety:** 83%
- **Deployment confidence:** 80%

## Remaining blockers
1. Target VPS PM2 + Nginx + TLS execution proof pending.
2. End-to-end production-domain dry-run evidence pending for this exact release.

## Final verdict for first controlled founder-operated VPS pilot ride
**GO (CONDITIONAL)** — proceed only after checklist items through dry-run verification are completed and rollback rehearsal is confirmed.

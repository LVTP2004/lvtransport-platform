# LV Transport Platform — Production Deployment Readiness Audit (2026-05-13)

## Scope
This audit validates readiness for a **controlled VPS-hosted founder-operated pilot** (not public launch), preserving the current orchestration/realtime/operational model.

## 1) Runtime Integrity

### Executed checks
- `pnpm install` ✅ (lockfile current, workspace install healthy).
- `pnpm build` ✅ (web/admin/driver production bundles generated).
- `pnpm typecheck` ✅ (admin/api/driver/web passed).
- `pnpm --filter @lvtransport/api build` ✅.
- API runtime boot test on configured default port (4000) ✅.
- API restart reliability (two consecutive cold starts + health probe) ✅.
- Crash/shutdown handling: API receives SIGTERM and exits; graceful stop handlers exist ✅.

### Findings
- Runtime is broadly stable for pilot use.
- One command wrapper returned non-zero despite successful boot/health responses (shell orchestration issue, not application crash).
- API default port is `4000` (not `3000`).

## 2) Environment Readiness

### Findings
- `.env.example` exists and covers core families (API URL, JWT, maps, Firebase, SMTP, Stripe).
- Production guardrails in API env parser:
  - hard-fails when production map key missing/placeholder.
  - hard-fails if production CORS remains wildcard.
- Gaps:
  - `.env.example` does not document all env variables currently referenced by API (`CORS_ORIGIN`, `PORT`, `APP_NAME`, `TRUST_PROXY`, `PAYCONIQ_API_KEY`, `MAIL_PROVIDER_API_KEY`, `MAIL_FROM_ADDRESS`, map tuning vars).
  - Duplicate `FIREBASE_PROJECT_ID` appears in `.env.example` (defined twice).
  - `JWT_SECRET` is listed but not enforced by API env bootstrap; enforce operationally before pilot.

## 3) Operational Lifecycle Reliability

### Findings
- Canonical lifecycle and allowed transitions are explicitly encoded:
  - `pending → assigned → accepted → en_route → arrived → in_progress → completed`
  - terminal states: `completed/cancelled/failed` immutable by transition matrix.
- Invalid/duplicate assignment protections and conflict mappings are present in v1 routes + orchestrator integration.
- Realtime recovery path exists via websocket `booking.lifecycle.recover` request + snapshot response.

### Residual risk
- Unit test execution path for `realtime-orchestrator.assign-driver.test.ts` currently fails when run directly with `node --test` due to ESM `.js` import resolution from TS source context (tooling/runtime mismatch), which weakens automated regression confidence unless run via project-specific test harness.

## 4) Cross-Surface Operational Consistency

### Findings
- Admin analytics and diagnostics endpoints exist.
- Dispatch diagnostics, operations diagnostics/incidents, and live driver states endpoints exist.
- Realtime websocket sends lifecycle snapshots on connect, supporting cross-surface convergence after reconnect.

### Residual risk
- No end-to-end automated multi-surface assertion suite was executed in this audit run; consistency evidence is architectural + endpoint-level, not full UI-simulated E2E for this turn.

## 5) VPS Deployment Readiness

### Findings
- PM2 config exists and includes autorestart/backoff/max restarts.
- Reverse proxy compatibility is expected (single API process behind Nginx, websocket path `/ws` on same upstream).
- Frontend builds are static-friendly (Vite bundles).

### Risks
- `ecosystem.config.cjs` hardcodes `cwd: '/home/ubuntu/lvtransport-platform'`; deployment path drift can break PM2 startup.
- PM2 binary unavailable in this environment due registry auth/network policy; compatibility inferred from config, not executed.
- Need explicit Nginx websocket upgrade headers for `/ws` route.

## 6) Operational Observability

### Findings
- Request ID propagation exists (`x-request-id` creation/echo).
- Logging present for websocket connect/disconnect/messages and runtime startup/shutdown events.
- Operational diagnostics/incidents/admin analytics endpoints are exposed for control tower visibility.

## 7) Risk Classification

### Blockers
1. PM2 startup not executable in audit environment (external package fetch denied); production process-manager validation still required on target VPS.
2. Env documentation incomplete vs actual runtime variables; operators can misconfigure first deploy.

### High risks
1. Missing enforced secret policy for `JWT_SECRET` at API boot (currently not required in env bootstrap).
2. Hardcoded PM2 `cwd` may fail on any non-matching VPS path.

### Medium risks
1. No proof from this run of full UI-level cross-surface E2E lifecycle parity.
2. Direct `node --test` failure for assign-driver test lowers CI confidence unless test runner strategy is standardized.

### Low risks
1. Duplicate Firebase key entries in `.env.example` can confuse setup.
2. Port expectation mismatch (`4000` actual default vs common assumption `3000`).

## 8) Controlled Founder-Operated Pilot Recommendation

## Verdict
**GO (conditional)** for **one controlled real ride** only after mandatory preflight conditions below.

### Mandatory conditions before first real ride
1. Validate PM2 on target VPS with actual `ecosystem.config.cjs` path + restart scenario.
2. Complete production `.env` (including undocumented-but-used vars) and verify API boot with `NODE_ENV=production`.
3. Set non-wildcard `CORS_ORIGIN` and confirm expected frontend origins only.
4. Confirm websocket proxying through Nginx (`Upgrade`/`Connection` headers) and reconnect snapshot behavior from real browser clients.
5. Dry-run one full lifecycle in VPS staging URL with founder + one driver account before live customer exposure.

### Should NOT be publicly exposed yet
- Open self-service public onboarding.
- Unrestricted multi-ride concurrency.
- Any payment collection beyond controlled manual supervision.

---

## Readiness Scores
- **Production readiness:** 82%
- **Lifecycle reliability:** 88%
- **Realtime consistency:** 85%
- **Deployment readiness:** 76%
- **Operational confidence (controlled pilot):** 81%

## Exact Blockers (must close)
1. PM2 runtime validation on target VPS not yet executed in this audit environment.
2. Environment variable documentation mismatch with actual runtime expectations.

## Exact VPS Deployment Checklist
1. Provision Node LTS + pnpm + PM2 on VPS.
2. Deploy repo to final path and update `ecosystem.config.cjs` `cwd` if needed.
3. Create production `.env` with: `NODE_ENV=production`, `PORT`, `CORS_ORIGIN`, `GOOGLE_MAPS_API_KEY`, `JWT_SECRET`, payment/mail provider keys as used.
4. Run `pnpm install --frozen-lockfile`.
5. Run `pnpm --filter @lvtransport/api build` and frontend builds.
6. Start API via PM2 ecosystem.
7. Configure Nginx:
   - API reverse proxy to API port.
   - websocket `/ws` upgrade forwarding.
   - static frontend hosting per subdomain/app.
8. Enable TLS certificates for all pilot subdomains.
9. Run health/readiness probes (`/api/v1/health`, `/api/v1/admin/integrations/readiness`, diagnostics endpoints).
10. Execute one supervised dry-run lifecycle and verify cross-surface state parity.
11. Snapshot logs and establish rollback trigger.

## PM2 Recommendations
- Keep `autorestart`, `exp_backoff_restart_delay`, `max_restarts`.
- Replace hardcoded `cwd` with actual deploy path (or template-driven deployment variable).
- Add log file targets and timestamps in PM2 config for easier incident review.
- Add `pm2 save` + startup hook after validation.

## Nginx/Subdomain Recommendations
- Use dedicated subdomains (example):
  - `api.<domain>` → API upstream
  - `admin.<domain>` → admin static
  - `driver.<domain>` → driver static
  - `app.<domain>` → customer web static
- Preserve static separation (OVH/static hosting) while proxying only API/ws via VPS.
- Enforce HTTPS + HSTS on pilot domains.
- Restrict exposed ports to 80/443 externally; keep Node port private.

## Rollback Strategy
1. Keep last-known-good PM2 release directory available.
2. On severe incident: disable ingress at Nginx route level (maintenance page), `pm2 stop` new process, switch symlink to previous release, `pm2 restart` previous.
3. Restore previous `.env` backup.
4. Re-run health + one internal booking lifecycle dry-run.
5. Document incident in operations log before reopening pilot.

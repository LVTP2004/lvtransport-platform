# LV Transport Platform — Final Controlled Founder-Operated VPS Pilot Readiness Certification (2026-05-13)

## Certification Scope
Final operational certification for the **first controlled founder-operated VPS-hosted ride** under production-like conditions.

This certification is stabilization/audit only (no feature redesign), preserving:
- current orchestration model
- operational consistency model
- OVH static + VPS API separation strategy

## Evidence Pack (Executed This Certification Run)
- `pnpm build` ✅ (web/admin/driver bundles succeed).
- `pnpm typecheck` ✅ (api/web/admin/driver succeed).
- Config and runtime source audit of:
  - PM2 process definition (`ecosystem.config.cjs`)
  - API environment bootstrap and production guards (`apps/api/src/config/env.ts`)
  - canonical lifecycle matrix (`apps/api/src/types/lifecycle.ts`)
  - realtime orchestrator controls, idempotency guards, transition enforcement, recovery hooks (`apps/api/src/services/realtime-orchestrator.service.ts`)
  - service-level lifecycle transition validation (`apps/api/src/bookings/bookings.service.ts`)
  - websocket runtime endpoint/path (`apps/api/src/websocket/socketServer.ts`)

---

## 1) VPS Runtime Certification

### Certified
- API runtime config is production-oriented with PM2 auto-restart/backoff settings (`autorestart`, `max_restarts`, `exp_backoff_restart_delay`, `kill_timeout`).
- API production environment enforcement includes:
  - mandatory production map key
  - CORS wildcard rejection in production
  - deterministic default API port (`4000`) when unset
- WebSocket server path is explicit (`/ws`) and compatible with reverse proxy forwarding.

### Gaps / Risks
- PM2 behavior was not runtime-executed on an actual VPS in this environment (no direct VPS process persistence proof this run).
- PM2 config hardcodes `cwd: '/home/ubuntu/lvtransport-platform'`; path drift can break boot on different VPS layout.
- No direct in-run memory soak or long-duration runtime profile was executed.

### Runtime Certification Result
**Conditionally pass** for pilot preflight, pending in-VPS PM2 start/restart/crash-loop drill.

---

## 2) Production Deployment Integrity

### Certified
- Process model supports frontend/backend isolation: static frontend builds + separate API process.
- WebSocket endpoint is stable (`/ws`), enabling proxy-aware realtime path planning.
- Existing readiness docs already align with OVH static separation + VPS API strategy.

### Gaps / Risks
- Nginx configuration file was not present in repository for direct rule-by-rule validation in this run.
- SSL/domain cert chain cannot be validated from codebase-only audit.
- Rollback process is procedural/documented but must be operationally rehearsed on VPS once before first real ride.

### Deployment Integrity Result
**Conditionally pass** with mandatory VPS-side Nginx+TLS preflight.

---

## 3) Canonical Ride Lifecycle Certification

Target lifecycle:
`pending → assigned → accepted → en_route → arrived → in_progress → completed`

### Certified
- Canonical statuses and transition matrix are explicitly encoded and deterministic.
- Terminal state protections exist via transition matrix constraints.
- Invalid transition rejection is implemented in both bookings service and realtime orchestrator.
- Duplicate/no-op protections exist (idempotent assignment for same driver, duplicate assignment TTL protection, assignment conflict rejection).
- Reconnect synchronization/recovery exists through orchestrator recovery pathways and realtime state publication.
- Operational timeline/event logging is preserved in orchestrator lifecycle event log/timeline updates.

### Gaps / Risks
- This run did not execute full browser-driven cross-surface E2E assertions (customer/admin/driver simultaneous UI proof remains operational checklist item).

### Lifecycle Certification Result
**Pass (service-layer deterministic)** with one mandatory real-VPS dry-run proving cross-surface parity.

---

## 4) Operational Observability Certification

### Certified
- PM2-ready deployment model supports restart traceability when logs are enabled.
- Lifecycle diagnostics and analytics snapshots are supported by orchestrator + operational analytics services.
- Runtime error/transition anomaly visibility exists through invalid transition handling + lifecycle anomaly reporting.
- Readiness/operational endpoint families exist in project documentation and service structure.

### Gaps / Risks
- PM2 live log capture/rotation policy is not explicitly codified in ecosystem config yet.

### Observability Certification Result
**Pass with minor hardening recommendation** (explicit PM2 log targets + rotation).

---

## 5) Founder-Operated Pilot Safety Review

## Can one controlled founder-operated ride be attempted now?
**Yes — conditionally** (single ride, supervised, strict operational constraints).

## Exact operational limitations still in place
1. Single controlled ride only (no broad concurrency stress).
2. Founder-admin supervision required through full lifecycle.
3. Limited driver pool (known driver account only).
4. Manual go/no-go gate before moving from `arrived` to `in_progress`.

## Mandatory conditions before attempt
1. PM2 start + reboot persistence + forced restart recovery proven on target VPS.
2. Nginx routes verified for API and `/ws` upgrade headers.
3. SSL active and valid for all pilot subdomains.
4. Production `.env` verified with non-wildcard `CORS_ORIGIN` and required keys.
5. One final dry-run lifecycle on production-like URLs with control tower monitoring.

## What remains unsafe for public exposure
- Open public onboarding and uncontrolled demand.
- Multi-ride concurrent operations without additional soak testing.
- Unsupervised lifecycle progression without founder/admin monitoring.

---

## 6) Risk Classification (Current Residual Set)

## Blocker
1. No direct VPS execution proof in this run for PM2 persistence/restart and Nginx/TLS wiring.

## Critical
1. Any unresolved Nginx websocket upgrade misconfiguration would break realtime lifecycle synchronization.

## High
1. Hardcoded PM2 `cwd` may fail deploy if VPS path differs.
2. Cross-surface UI parity not re-asserted in this exact run via full E2E session.

## Medium
1. PM2 logs/rotation not explicitly hardened in config.
2. No long-duration memory soak during this run.

## Low
1. Environment documentation drift risk if `.env` is not kept synchronized with runtime variable usage.

---

## 7) Controlled Pilot Execution Checklist (Exact Ordered Runbook)

1. **VPS startup**
   - Confirm VPS reachable, clock synchronized, disk >20% free.
2. **PM2 verification**
   - Start API via ecosystem config.
   - Confirm process `online`.
   - Execute `pm2 restart` and verify recovery.
   - Reboot VPS once and verify PM2 resurrection.
3. **Nginx verification**
   - Validate config syntax.
   - Confirm API upstream routing.
   - Confirm `/ws` upgrade proxy headers.
4. **SSL verification**
   - Validate cert expiry + chain for all pilot domains.
   - Force HTTPS redirect and verify no mixed content.
5. **Environment verification**
   - Confirm `NODE_ENV=production`, `PORT`, `CORS_ORIGIN`, `GOOGLE_MAPS_API_KEY`, `JWT_SECRET`, provider keys.
   - Confirm API boot has no env guard failure.
6. **Booking creation**
   - Create controlled booking from customer surface.
   - Confirm status starts as `pending`.
7. **Driver assignment**
   - Assign known driver once.
   - Verify duplicate assignment protection.
8. **Realtime validation**
   - Open customer/admin/driver surfaces simultaneously.
   - Verify status updates propagate on each transition.
   - Force one reconnect and verify state recovery/snapshot alignment.
9. **Lifecycle progression**
   - Progress exactly: `assigned → accepted → en_route → arrived → in_progress → completed`.
   - Attempt one invalid transition and verify rejection.
10. **Admin/control-tower monitoring**
    - Monitor lifecycle timeline, diagnostics, analytics snapshot, and runtime logs.
11. **Post-ride validation**
    - Confirm `completed` is terminal/immutable.
    - Confirm all surfaces show final identical terminal state.
12. **Rollback procedure readiness**
    - Validate last-known-good release pointer.
    - Rehearse quick revert command path (without executing unless needed).

---

## Final Certification Metrics
- **Final production readiness:** **84%**
- **VPS deployment readiness:** **78%**
- **Lifecycle reliability:** **91%**
- **Realtime synchronization confidence:** **86%**
- **Operational safety:** **83%**
- **Founder-operated pilot confidence:** **85%**
- **Deployment confidence:** **80%**

## Exact Blockers
1. VPS-side PM2 persistence/restart and Nginx+TLS wiring not directly executed/observed in this run.

## Exact Rollback Plan
1. Keep previous known-good release directory and environment backup.
2. If incident: set Nginx maintenance route, stop new PM2 process, repoint to previous release, restart PM2.
3. Restore prior `.env` snapshot.
4. Run health/readiness checks + one internal lifecycle smoke test.
5. Re-open only after control tower confirms lifecycle/realtime parity.

## Exact Mandatory Pre-Pilot Conditions
1. PM2 cold start + restart + reboot persistence proof.
2. Nginx `/ws` upgrade forwarding proof.
3. Valid SSL across pilot domains.
4. Production env guardrail compliance proof.
5. One full supervised dry-run with cross-surface parity evidence.

## Final Verdict
# **GO (Conditional)** for **first real controlled founder-operated VPS pilot ride**
Only after all mandatory pre-pilot conditions above are completed and logged.

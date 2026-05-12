# LV Transport Platform — Controlled Pilot Deployment Plan

Date: 2026-05-12 (UTC)

## 0) Scope & Non-Negotiables
This plan preserves the current operational structure:
- no frontend redesign;
- no new architecture introduced;
- Moni Assistant integration preserved;
- realtime booking engine preserved;
- admin/control tower structure preserved;
- driver lifecycle flow preserved.

The plan is deliberately conservative and assumes the current VPS + PM2 + Nginx deployment pattern remains in place.

---

## 1) Pilot Environment Validation (Current Architecture)

### 1.1 VPS runtime assumptions
Validate on the pilot VPS before any customer traffic:
1. Node/pnpm versions match lockfile expectations.
2. `pnpm install --frozen-lockfile` passes.
3. API build command succeeds (`pnpm --filter @lvtransport/api build`).
4. API process can start from PM2 with production env file loaded.

Why this is required now:
- Current deployment script hard-resets to `origin/main`, installs dependencies, builds API, then reloads PM2. If the build fails, deployment must stop immediately.

### 1.2 PM2 process strategy
Use existing single-process API strategy in `ecosystem.config.cjs`:
- process name: `lvtransport-api`;
- command: `pnpm --filter @lvtransport/api start`;
- `autorestart`, exponential backoff, and restart limits already configured.

Pilot checks:
1. Confirm exactly one PM2 process for API in founder/operator pilot.
2. Confirm restart loop behavior is bounded (`max_restarts`, `min_uptime`).
3. Confirm `pm2 save` after known-good rollout.

### 1.3 Nginx reverse proxy structure
Keep current pattern (TLS termination + reverse proxy to API host/port); validate:
1. `/api/health` upstream reaches Express health route.
2. WebSocket upgrade headers are enabled for `WS_PATH` (default `/ws`).
3. Proxy read/send timeouts are long enough for realtime sessions.
4. Access/error logs rotate and are retained for incident review.

### 1.4 Environment variable handling
Current API boot validates env constraints:
- production rejects missing placeholder `GOOGLE_MAPS_API_KEY`;
- production rejects wildcard `CORS_ORIGIN=*`;
- startup validates `PORT` and `WS_PATH` shape.

Pilot checks:
1. Full production `.env` exists on VPS (not committed).
2. `STARTUP_DIAGNOSTICS=true` for pilot phase.
3. Explicit `TRUST_PROXY` set according to Nginx topology.
4. `NODE_ENV=production`, deterministic `PORT`, and explicit `CORS_ORIGIN`.

### 1.5 Production build artifact locations
Current deployment executes in `/home/ubuntu/lvtransport-platform` and starts API via workspace package scripts. Validate:
1. compiled API output exists after build in expected package output path;
2. PM2 `cwd` matches deployed repo directory;
3. startup command resolves built artifact, not stale local state.

### 1.6 Health endpoint monitoring
Primary pilot health probe should be:
- `GET /api/health` via Nginx public origin.

Monitoring pattern:
- every 30s synthetic check;
- alert on 3 consecutive failures;
- include response body validation (`success=true`, `status=healthy`, timestamp freshness).

---

## 2) Controlled Pilot Scope

## 2.1 Operating mode
- Founder/operator mode only.
- Single active driver account.
- Small invited customer list (manual allowlist).

## 2.2 Booking volume controls
- Max 5 concurrent active bookings.
- Target 10–20 completed pilot rides/day.
- Manual pause rule: suspend new customer intake after any Sev-1 incident.

## 2.3 Change management controls
- One deployment window per day.
- No same-day schema/interface drift during operating hours.
- Rollback-ready before each release.

## 2.4 Observability-first constraints
- If telemetry/booking observability is degraded, operations fall back to manual-only assignment and limited traffic.
- No scaling changes during pilot unless stability targets are met for 7 consecutive days.

---

## 3) Operational Monitoring Plan

### 3.1 Realtime reconnect monitoring
Track:
- websocket reconnect attempts per client;
- reconnect success latency;
- session restore success/failure rates.

### 3.2 WebSocket stability checks
Track:
- active socket count;
- unexpected disconnect rate;
- message replay backlog size;
- idempotency cache size (as stability signal under retries).

### 3.3 Booking lifecycle monitoring
Track lifecycle transitions:
`requested -> assigned -> accepted -> in_progress -> completed/cancelled`.

Alert on:
- invalid backward transitions;
- terminal state mutation attempts;
- transition timeout breaches.

### 3.4 API incident visibility
Minimum incident dashboard widgets:
- 5xx rate by endpoint;
- p95 latency by endpoint;
- booking action error counts (`assign`, `status`, driver telemetry).

### 3.5 Runtime logging strategy
- Keep structured API logs enabled.
- Tag by bookingId/driverId/idempotencyKey when present.
- Separate:
  - deploy logs;
  - PM2 process logs;
  - Nginx access/error logs.

### 3.6 Rollback/recovery procedure
1. Detect incident and classify severity.
2. Freeze new deployments.
3. Switch traffic to last known-good git SHA.
4. `pm2 startOrReload ecosystem.config.cjs --update-env`.
5. Run smoke tests.
6. Resume controlled volume only after validation.

### 3.7 Stale session detection
Define stale session heuristics:
- websocket connected but no event heartbeat beyond threshold;
- driver telemetry timestamp lag > configured window;
- session reconnect token replay mismatch.

Action:
- force session refresh path;
- require state rehydrate before new assignment actions.

### 3.8 Deployment rollback safety
- Keep previous artifact/Git SHA immediately available.
- No destructive data migrations in pilot windows.
- Rollback drill once per week during pilot.

---

## 4) Runtime Safety Validation Checklist

Before opening pilot traffic, validate in staging and then production:
1. Auth protection for all protected routes.
2. Admin route protection enforcement.
3. Driver route protection enforcement.
4. Lifecycle immutability in terminal states.
5. Duplicate booking prevention under retry/reload.
6. Idempotency behavior for assign/status/telemetry writes.
7. Terminal state enforcement (`completed`/`cancelled` cannot regress).

Gate rule:
- if any item fails, do not increase traffic envelope.

---

## 5) Pilot KPI Strategy

## 5.1 KPI definitions (pilot baseline)
1. **Successful booking %** = completed bookings / created bookings.
   - Target: >= 92% during controlled pilot.
2. **Reconnect stability** = successful reconnects / reconnect attempts.
   - Target: >= 97%.
3. **Realtime consistency** = sessions with matching customer/admin/driver state snapshots.
   - Target: >= 98%.
4. **Booking assignment latency** (admin assign -> driver receives event).
   - Target p95 <= 2.5s.
5. **Admin-driver sync quality** = assignment/status mismatch incidents per 100 trips.
   - Target <= 1 per 100.

## 5.2 Incident severity classes
- **Sev-1:** customer safety/completion at risk, widespread realtime failure, or auth boundary failure.
- **Sev-2:** significant workflow degradation with workaround.
- **Sev-3:** localized/non-critical defect with no safety impact.

Pilot stop conditions:
- any Sev-1;
- >= 3 Sev-2 incidents in 24h;
- KPI miss for 2 consecutive days on successful booking % or realtime consistency.

---

## 6) Deployment Sequence

## 6.1 Exact recommended deployment order
1. Pull latest code on VPS.
2. Install dependencies with frozen lockfile.
3. Build API package.
4. Run API smoke-level route/health checks locally on VPS.
5. Reload PM2 with updated env.
6. Validate Nginx upstream health.
7. Enable controlled traffic window.

## 6.2 Staging validation sequence
1. Build/typecheck gate.
2. Auth + role access test.
3. Booking create/assign/accept/start/complete flow.
4. Reconnect simulation (driver + admin refresh/reconnect).
5. Duplicate request replay (idempotency keys).
6. WebSocket stability test for 30+ minutes.
7. Incident log review and signoff.

## 6.3 Production rollout sequence
1. Founder/operator preflight checklist complete.
2. Deploy during low-demand window.
3. Health + websocket + booking smoke tests.
4. Open pilot to first batch (limited customers).
5. Observe 60 minutes before allowing additional bookings.

## 6.4 Rollback order
1. Freeze new bookings.
2. Disable pilot intake.
3. Revert to prior known-good commit.
4. Rebuild + PM2 reload.
5. Re-run smoke suite.
6. Resume only founder/manual mode first.

## 6.5 Post-deploy smoke tests
Run immediately after each deployment:
1. `GET /api/health` success and freshness.
2. Create one test booking.
3. Assign driver once (verify no duplicates).
4. Driver status transition once per lifecycle stage.
5. Validate customer/admin/driver status convergence.
6. Validate telemetry ingestion and visibility.

---

## 7) Readiness, Maturity, and Remaining Risks

## 7.1 Pilot deployment readiness score
**Readiness score: 30/100 (not launch-ready today).**

Reason:
- Current repository state has existing documented build/typecheck blockers from latest operational validation; pilot should remain blocked until compile baseline is green.

## 7.2 Operational maturity assessment
**Maturity: Early operational beta (architecture present, runtime hardening incomplete).**

Strengths:
- clear deployment script and PM2 process model;
- explicit environment/runtime boot validation;
- health endpoint and realtime orchestration scaffolding.

Gaps:
- compile integrity instability from latest audit;
- uncertain lifecycle confidence until hardening gates pass.

## 7.3 Remaining production risks
1. lifecycle desync under reconnect/retry edges;
2. stale session propagation and replay race conditions;
3. auth/role boundary regressions under hotfix pressure;
4. operational blind spots if logs/metrics are not centralized.

---

## 8) Recommended Founder/Operator Launch Strategy

1. Keep pilot to founder + one driver + invited riders only.
2. Enforce booking cap and daily operations window.
3. Require green build/typecheck before every pilot day.
4. Use a go/no-go checklist 30 minutes pre-shift.
5. Stop pilot on Sev-1 immediately and rollback.

---

## 9) Recommended Next Engineering Milestone

**Milestone:** “Pilot Hardening Gate v1”

Definition of done:
1. build and typecheck consistently green;
2. lifecycle transition guard tests pass;
3. reconnect + stale-session recovery tests pass;
4. idempotency replay tests pass for booking assignment and status transitions;
5. post-deploy smoke checklist automated and repeatable.

Only after this milestone should customer volume be expanded beyond controlled pilot thresholds.

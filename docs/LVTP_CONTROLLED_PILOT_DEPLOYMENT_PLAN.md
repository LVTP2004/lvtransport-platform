# LV Transport Platform (LVTP) Controlled Pilot Deployment Plan

## 1) Pilot Deployment Architecture

### 1.1 Objectives and guardrails
- Launch a **controlled, monitoring-first pilot** with a small set of real customers and founder-operator manual supervision.
- Preserve current LVTP architecture and branding; prioritize stability over feature expansion.
- Keep human approval and manual override available at every critical operation step.
- No destructive refactors, no fake integrations, and no assumptions of autoscaling.

### 1.2 Recommended pilot topology (single VPS, separated environments)
- **One production VPS** (minimum 4 vCPU, 8 GB RAM, 160+ GB SSD, Ubuntu 22.04 LTS).
- **One staging VPS** (minimum 2 vCPU, 4 GB RAM, 80+ GB SSD).
- **Nginx** as reverse proxy + TLS termination.
- **PM2** for process supervision of Node services (API, web app, admin app, realtime service, Moni Assistant worker if isolated).
- **Managed PostgreSQL** (preferred) or hardened self-hosted Postgres on separate volume.
- **Redis** for queues/realtime buffering/session cache if already used.
- **Object storage** (S3-compatible) for logs/archive backups if required.

### 1.3 Environment separation strategy
- Distinct infrastructure per env: `staging` and `production`.
- Distinct DB instances or at minimum distinct DB names + credentials.
- Distinct Redis DB/instance and queue namespaces.
- Distinct PM2 ecosystem apps and process names.
- Distinct domains/subdomains (example):
  - `app-staging.lvtransport...`
  - `admin-staging.lvtransport...`
  - `api-staging.lvtransport...`
  - `app.lvtransport...`
  - `admin.lvtransport...`
  - `api.lvtransport...`
- Distinct third-party keys per environment.
- Strict rule: **no production secrets in code or in staging**.

### 1.4 Network and security baseline
- UFW allowlist: `22`, `80`, `443`; deny all others public.
- SSH key auth only; disable password auth.
- Dedicated non-root deploy user.
- Daily unattended security updates (or scheduled controlled patch window).
- TLS certificate automation (Let’s Encrypt) + monitored renewal.
- Nginx request size/rate limits for booking endpoints.

### 1.5 Data and backup baseline
- Postgres PITR (if managed) or nightly pg_dump + WAL strategy.
- Redis snapshotting if stateful data matters.
- Daily backup retention: 14 days minimum for pilot.
- Weekly restore drill in staging.

---

## 2) Operational Readiness Checklist

## 2.1 Pilot deployment checklist
- [ ] Founder-operator pilot boundaries defined (service area, operating hours, max active rides).
- [ ] Pilot customers pre-approved and documented with support contact channels.
- [ ] Driver app, customer app, admin dashboard versions frozen for pilot window.
- [ ] Manual dispatch override and manual booking approval toggles verified.
- [ ] Incident response contacts and escalation tree published.
- [ ] Pilot “go/no-go” meeting completed with explicit signoff.

## 2.2 Production environment checklist
- [ ] Production DNS records validated.
- [ ] Nginx config deployed with HTTPS redirect and security headers.
- [ ] PM2 ecosystem config validated and boot persistence enabled.
- [ ] Health endpoints available for all core services.
- [ ] DB migrations applied and schema version recorded.
- [ ] Seed/config data validated (vehicle classes, rates, regions, status enums).
- [ ] Monitoring stack active (uptime, logs, metrics, alerts).
- [ ] Backup job executed successfully at least once.
- [ ] Rollback package artifact prepared and stored.

## 2.3 Validation checklist before first real ride
- [ ] Booking creation persists in DB with immutable audit entry.
- [ ] Booking lifecycle status synchronization verified across API, admin, driver, customer apps.
- [ ] Realtime updates verified on mobile app while foreground/background.
- [ ] Admin dashboard sees every operational state transition.
- [ ] Driver accepts, starts, completes ride with consistent timestamps.
- [ ] Reconnect logic rehydrates valid state after network drop.
- [ ] Simulated failure triggers monitoring alert within SLA.
- [ ] Logs allow end-to-end trace by booking ID.

---

## 3) Founder-Operator Workflow

## 3.1 Daily startup sequence (operational startup sequence)
1. Confirm infra health: VPS, DB, Redis, PM2 process list.
2. Confirm monitoring channels online (email/Telegram/Slack/SMS).
3. Confirm no unresolved P1/P2 incidents from prior shift.
4. Enable pilot intake window in admin panel.
5. Validate one internal test booking end-to-end.
6. Mark operations status as “LIVE PILOT ACTIVE”.

## 3.2 First-driver operational flow
1. Driver logs in and sets status `ONLINE`.
2. Founder verifies driver location heartbeat and connectivity.
3. Founder assigns or approves first booking manually.
4. Driver accepts booking; admin confirms state propagates.
5. Driver starts trip; ETA updates verified.
6. Driver completes trip; payment/closure state verified.
7. Founder confirms final audit trail + customer confirmation message delivered.

## 3.3 First-customer booking flow
1. Customer creates booking request.
2. System records request in DB and emits booking-created event.
3. Founder manually validates booking details (pickup area, availability, fare logic).
4. Founder approves dispatch to driver.
5. Customer receives realtime status updates (accepted, en route, started, completed).
6. Customer receives closure summary/support contact.

## 3.4 Dispatch verification process
- For each booking, verify:
  - Booking ID exists in DB.
  - Dispatcher assignment logged with actor (system/human).
  - Driver assignment acknowledged within timeout.
  - If timeout exceeded: auto-escalate to manual reassignment.
  - All status timestamps monotonic and non-null where expected.

---

## 4) Recommended Deployment Sequence

1. **Staging freeze:** lock release candidate commit.
2. **Staging full regression:** booking lifecycle, realtime, reconnect, admin observability.
3. **Pilot rehearsal in staging:** founder-driven script with mock customer/driver.
4. **Production preflight:** backups, health checks, secrets verification, migration plan.
5. **Production deploy:** rolling order
   - API/backend
   - realtime/queue workers
   - admin/web frontend
   - Moni Assistant worker/rules
6. **Post-deploy smoke test:** 1 internal booking + 1 limited external booking.
7. **Pilot go-live:** limited intake cap enabled.
8. **Heightened watch window:** first 4–8 hours with founder active monitoring.

### 4.1 PM2 operational recommendations
- Use `ecosystem.config.cjs` with explicit env blocks per app.
- Set `max_restarts`, `restart_delay`, and memory restart thresholds.
- Enable startup persistence: `pm2 startup` + `pm2 save`.
- Separate logs per process with date rotation (`pm2-logrotate`).
- Use `pm2 monit` only as supplement; primary monitoring externalized.

### 4.2 Nginx production recommendations
- Enforce HTTPS and HSTS.
- Proxy timeouts tuned for realtime endpoints.
- WebSocket headers correctly forwarded.
- Rate-limit sensitive routes (`/booking`, `/auth`, `/admin/login`).
- Access/error logs tagged by upstream for quick triage.

---

## 5) Realtime Monitoring, Logging, and Alerts

## 5.1 Admin monitoring workflow
- Founder keeps admin operational board open with filtered views:
  - New bookings pending approval
  - In-progress rides
  - Stalled rides (> N minutes without update)
  - Failed dispatch attempts
- Every 15 minutes during pilot:
  - Check queue depth
  - Check unresolved incidents
  - Check driver connectivity status

## 5.2 Realtime monitoring procedures
- Track service uptime and response times:
  - API health endpoint latency
  - Realtime event delivery lag
  - DB connection saturation
- Create alert thresholds:
  - P1: API down > 60s
  - P1: booking writes failing > 2% over 5 min
  - P2: realtime lag > 15s median for 5 min
  - P2: driver heartbeat missing > 120s for active trip

## 5.3 Operational logging strategy
- Structured JSON logs with required fields:
  - `timestamp`, `service`, `environment`, `level`, `requestId`, `bookingId`, `driverId`, `customerId`, `statusFrom`, `statusTo`, `actorType`, `actorId`, `errorCode`
- Centralized log aggregation (Loki/ELK/Cloud provider).
- Correlate each booking with end-to-end trace via `bookingId` + `requestId`.
- Redact PII and secrets before persistence.
- Retention:
  - Hot searchable logs: 14–30 days
  - Archived logs: 90+ days for pilot audit

## 5.4 Moni Assistant escalation rules
- Rule 1: If automated decision confidence < threshold, require founder approval.
- Rule 2: If lifecycle contradiction detected (e.g., completed before started), escalate immediately to manual hold.
- Rule 3: If dispatch attempt fails twice, handoff to manual dispatch queue.
- Rule 4: If customer/driver reports mismatch, freeze automation on affected booking.
- Rule 5: For any payment or closure anomaly, block auto-close and require admin confirmation.

## 5.5 Customer support escalation flow
1. L1 (Founder/Ops): acknowledge within 5 minutes.
2. L2 (Technical on-call): investigate logs/events within 10 minutes.
3. L3 (Engineering fix/manual DB correction protocol): engage if data inconsistency or service degradation persists > 15 minutes.
4. Post-incident customer callback + compensation policy (if applicable).

---

## 6) Rollback, Incident Recovery, and Manual Override

## 6.1 Rollback procedures
- Keep previous stable artifact and PM2 process config.
- Trigger rollback when:
  - Booking persistence failures exceed threshold.
  - Lifecycle desynchronization recurrent across >2 bookings.
  - Admin loses operational visibility for critical states.
- Rollback steps:
  1. Pause new booking intake (maintenance mode/manual gate).
  2. Keep active rides visible; avoid killing sessions mid-ride if possible.
  3. Repoint PM2 to prior release artifact.
  4. Restart affected services in dependency order.
  5. Re-run smoke tests before resuming intake.

## 6.2 Emergency/manual recovery flow
1. Detect incident via alert or operator report.
2. Declare incident severity (P1/P2/P3).
3. Assign commander (founder during pilot).
4. Activate manual override mode:
   - manual dispatch only
   - manual status updates if realtime fails
   - direct driver-customer communication fallback
5. Stabilize in-flight bookings first.
6. Recover system state (service restart, cache flush rules, queue replay if safe).
7. Validate state consistency for all active booking IDs.
8. Resume controlled automation only after verification.

---

## 7) Pilot KPI Tracking

Track daily and per-shift:
- Booking success rate (created → completed).
- Dispatch acceptance time (P50/P95).
- Realtime state propagation delay (P50/P95).
- Manual override rate (% bookings requiring manual intervention).
- Incident count by severity.
- Mean time to detect (MTTD) and resolve (MTTR).
- Customer-reported issue rate.
- Driver app reconnect success rate.

Pilot success target (suggested):
- ≥ 95% successful booking lifecycle completion.
- ≤ 5% manual override rate after first stabilization week.
- 0 unresolved P1 incidents at end of operating day.

---

## 8) Pilot Risk Assessment

### High risks
- Realtime desynchronization across client/admin views.
- Hidden booking write failures under intermittent network issues.
- Manual process overload on founder during incident bursts.
- Incomplete logging reducing root-cause analysis ability.

### Mitigations
- Force write acknowledgments and lifecycle guard checks.
- Strict alerting with low thresholds in pilot phase.
- Hard cap on concurrent active rides.
- Prebuilt incident playbooks and communication templates.

---

## 9) Critical Production Blockers (must clear before first live pilot)

1. Missing end-to-end booking lifecycle observability by booking ID.
2. No tested rollback path to previous stable build.
3. Realtime reconnect failing to restore valid client state.
4. Admin dashboard cannot display all operational states in near realtime.
5. Backup restore process untested.
6. Moni Assistant lacks deterministic escalation handoff to human.

---

## 10) Recommended Next Technical Priorities

1. Add explicit lifecycle state-machine validation guards in backend.
2. Implement standardized operational event schema across all services.
3. Build incident dashboard (P1/P2 queue + stalled rides + dispatch failures).
4. Improve reconnect reconciliation logic for mobile clients.
5. Add synthetic booking probes every 5–10 minutes in production.
6. Automate daily pilot KPI report generation.

---

## 11) Estimated Readiness Percentage for Live Pilot

**Estimated readiness for controlled live pilot: 72%** (architecture-preparation estimate).

### Readiness rationale
- Strong conceptual architecture and operational plan coverage.
- Pilot constraints and manual override strategy reduce launch risk.
- Remaining readiness gap is mostly execution evidence: tested rollback, validated alerts, rehearsed incident response, and proven lifecycle synchronization in production-like conditions.

### Exit criteria to reach 85%+
- Complete full staging rehearsal with signed checklist evidence.
- Run one production dry-run (no real customers) with incident simulation.
- Validate backup restore and rollback within target time.
- Demonstrate stable operations for at least two full pilot shifts.

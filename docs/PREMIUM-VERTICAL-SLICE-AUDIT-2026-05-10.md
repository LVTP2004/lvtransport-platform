# LV Transport Platform Premium Audit (10 May 2026)

## Executive summary

The repository already contains a **strong architectural skeleton** for a multi-product transport platform (API domains, pricing, tracking, auth, realtime and admin modules), but the product is currently in a **foundation/scaffold stage** instead of an operational Uber-style flow.

Critical conclusion: the highest-leverage move is to deliver one production-like vertical slice end-to-end:

`Quote -> Booking -> Payment authorization -> Driver assignment -> Live tracking -> Trip lifecycle -> Notifications`

without adding new product modules.

---

## 1) Current technical status (re-audit)

### What is already reusable now

1. **Monorepo organization and domain separation are present** (`apps/*`, `packages/*`, docs and modular API structure). This is a valid base for SaaS scaling.
2. **Pricing domain exists in API** with estimators, orchestrator and admin fare management files under `apps/api/src/pricing/*` and `apps/api/src/modules/pricing/*`.
3. **Realtime and tracking packages exist** (`packages/realtime`, `packages/maps`) with event names, models, firebase bridge and tracking abstractions.
4. **Auth package and RBAC concepts are scaffolded** in `packages/auth` and API auth middleware/providers.
5. **Moni Assistant package already exists as reusable shared package**, with booking/status dispatcher patterns and dependency-injection style contracts (`packages/moni-assistent/src/*`).

### Main blockers before real operations

1. **Implementation duplication/inconsistency (TS + JS side-by-side)** appears in multiple apps, increasing drift and incident risk (for example admin auth/pricing modules and API pricing files).
2. **Conflicting API bootstrap/app setup paths** exist (mixed middleware imports and duplicated function structure in `apps/api/src/app.ts`), indicating incomplete consolidation.
3. **Core business services are still placeholders** in key domains (e.g., booking/tracking publish methods return mock-like objects and TODO comments).
4. **Documentation says “documentation-first / skeleton stage”**, which confirms mismatch versus desired live operations.
5. **No explicit single source-of-truth orchestration for the full trip lifecycle** across quote, payment auth, dispatch, trip state transitions, and notifications.

---

## 2) Reusable components vs refactor targets

### Reuse directly (keep and connect)

- `packages/moni-assistent`: keep as shared intelligence module, but harden contracts and role policies.
- `packages/realtime` + `packages/maps`: keep event/model abstractions as backbone for tracking and trip state propagation.
- `apps/api/src/pricing/*`: reuse pricing engine/orchestrator as canonical quote path.
- `packages/auth` + API auth middleware: reuse for JWT+RBAC and role scoping.
- `packages/ui`: reuse as design-system seed to enforce consistent premium UX across web/admin/driver.

### Refactor immediately (high priority)

1. **TypeScript as only runtime source**
   - Remove/phase out parallel `.js` files generated or committed beside `.ts` in `apps/api/src` and `apps/admin/src`.
   - Ensure builds output to dedicated dist folders only.

2. **API app bootstrap consolidation**
   - Normalize to one app initialization path and one middleware naming convention.
   - Resolve duplicated app factory shape and route imports.

3. **Vertical-slice orchestration layer in API**
   - Introduce a single `TripLifecycleOrchestrator` (or equivalent) coordinating: quote, booking persistence, payment auth, dispatch request, tracking session, status transitions, notifications.

4. **State machine enforcement**
   - Enforce strict transition graph: `pending -> validated -> priced -> assigned -> accepted -> on_route -> arrived -> in_progress -> completed` (+ cancel/issue paths).

5. **Operational observability baseline**
   - Correlation IDs per booking/trip, structured logs, event audit trail, and admin incident timeline.

---

## 3) Moni Assistant as core operational intelligence

Moni must remain a shared package but evolve from flow helpers into **role-aware operational intelligence**:

### Required architecture position

- Shared module used by:
  - public/client platform
  - admin control tower
  - driver platform
  - API orchestration endpoints/jobs
- Role-specific policy layers:
  - `client` guardrails (booking guidance, quote clarification, status guidance)
  - `admin` guardrails (incident summaries, reassignment recommendations)
  - `driver` guardrails (trip instructions, status prompts, escalation)

### Required contracts

Moni should consume only explicit interfaces for:
- Booking read/write facade
- Pricing quote facade (read-only for final price confirmation rules)
- Tracking status feed
- Notification dispatch facade
- Auth/RBAC context
- Audit/event writer

### Security and control

- No secrets/internal infra exposure in responses.
- No critical action without role + explicit authorization.
- Every sensitive assistant action logs an audit event.
- Separate prompt templates and tool permissions by role.

---

## 4) Consolidated target architecture

### Domain services (API)

- `QuoteService` (deterministic quote + confidence)
- `BookingService` (booking lifecycle + idempotency)
- `PaymentService` (auth/capture/refund flow)
- `DispatchService` (driver candidate ranking + assignment)
- `TrackingService` (trip telemetry ingest + customer-safe projection)
- `TripLifecycleOrchestrator` (cross-domain coordinator)
- `NotificationService` (multi-channel delivery + retries)
- `MoniOrchestrationService` (assistant runtime facade)

### Platform boundaries

- `apps/main-web`: marketing + fast booking entry
- `apps/ride` / client app: booking, live map, history, support
- `apps/driver`: accept/reject, nav state, earnings snapshot
- `apps/admin`: control tower, incident center, manual override controls
- `apps/api`: single system of record and event producer

### Event backbone

Canonical event stream per booking/trip:
- `quote.requested`, `quote.computed`
- `booking.created`, `payment.authorized`
- `driver.assignment.requested`, `driver.assigned`
- `trip.status.changed` (state machine validated)
- `trip.completed`, `payment.captured`
- `notification.sent|failed`
- `incident.raised|resolved`

---

## 5) Professional phased roadmap

### Phase A — MVP Operacional (vertical slice only)

Goal: one city/zone, one payment provider path, one driver assignment strategy, real live tracking.

Deliverables:
1. Deterministic quote endpoint with persisted quote artifact.
2. Booking creation tied to quote reference.
3. Payment authorization flow before assignment.
4. Driver assignment and accept/reject handling.
5. Live tracking channel for customer + admin + driver.
6. Trip state machine enforced server-side.
7. Completion + payment capture + invoice stub + notifications.
8. Moni role-aware assistant v1 integrated into this lifecycle.

### Phase B — Staging hardening

- Load + chaos tests on realtime and lifecycle transitions.
- Replay tests for idempotency and webhook duplication.
- Admin incident workflows and operational runbooks.
- Security tests (RBAC escape attempts, token misuse, prompt guardrails).

### Phase C — Beta privada

- Limited clients/drivers onboarding.
- SLA monitoring and on-call routines.
- UX tuning for booking friction and driver acceptance latency.

### Phase D — Producción inicial

- Production observability dashboards.
- Financial reconciliation and audit exports.
- Backup/recovery drills and deployment rollback discipline.

### Phase E — Escalabilidad

- Multi-zone dispatch strategy.
- Advanced pricing policies.
- Wallet/subscription/business rules.
- LV Eats expansion only after core mobility KPIs remain stable.

---

## 6) Real technical priorities (ordered)

1. **Stabilize API runtime and remove TS/JS duplication.**
2. **Implement end-to-end lifecycle orchestrator (vertical slice).**
3. **Payment auth + capture correctness (idempotent).**
4. **Dispatch + realtime status propagation consistency.**
5. **Operational observability + auditability.**
6. **Moni assistant role-safe integration with business events.**
7. **UX convergence client/driver/admin around same lifecycle truth.**

---

## 7) Key technical risks

1. **State divergence risk** between modules without central orchestrator.
2. **Duplicate source risk** due to committed `.js` and `.ts` variants.
3. **Payment inconsistency risk** without strict idempotency/webhook strategy.
4. **Realtime trust risk** if customer/admin/driver timelines diverge.
5. **Security risk** if Moni can execute privileged actions without strict RBAC checks.
6. **Operational risk** without incident tooling and replayable audits.

---

## 8) Next sprint (exact)

### Sprint objective (2 weeks)
Ship the first **fully testable vertical slice** in staging.

### Sprint backlog (must-do)

1. **Architecture cleanup**
   - Remove/disable duplicate JS runtime sources in API/Admin.
   - Consolidate API app bootstrap and middleware chain.

2. **Lifecycle implementation**
   - Create `TripLifecycleOrchestrator` with transaction boundaries and idempotency keys.
   - Implement endpoints:
     - `POST /quotes`
     - `POST /bookings`
     - `POST /bookings/:id/payment/authorize`
     - `POST /bookings/:id/dispatch`
     - `POST /bookings/:id/status`
     - `POST /bookings/:id/complete`

3. **Realtime + tracking**
   - Wire booking/trip events to websocket/realtime channels.
   - Build customer-safe tracking projection API.

4. **Moni integration v1**
   - `client` booking helper (collect required fields + status assistant)
   - `admin` incident summary helper
   - `driver` trip instruction helper
   - audit events for assistant-triggered actions

5. **Testing and quality gates**
   - Contract tests per endpoint.
   - State machine transition tests.
   - Payment idempotency tests.
   - End-to-end test: quote -> complete.

### Sprint exit criteria

- A booking can be created from a real quote and completed with payment capture.
- Driver and customer see coherent live status updates.
- Admin sees same timeline and can handle incident/reassignment.
- Moni works with role guardrails and no secret leakage.
- CI passes with typecheck + tests on the vertical slice.

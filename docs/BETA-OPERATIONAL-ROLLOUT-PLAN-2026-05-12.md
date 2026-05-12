# LV Transport Platform — Limited Beta Operational Rollout Plan (2026-05-12)

## Scope and Intent

This plan prepares LV Transport Platform (LVTP) for **limited, controlled, real-world beta operations** without introducing major new features or UI redesign.

Primary outcomes:
- Enable first operational rides with strict safeguards.
- Onboard a small pilot set of customers and drivers safely.
- Monitor stability across realtime, payment, GPS, dispatch, and support workflows.
- Preserve rollback options at all times.

---

## 1) Beta Rollout Strategy

### Phase 0 — Internal Dry Run (T-7 to T-1 days)
- Freeze non-critical merges and only allow stability fixes.
- Validate core production flows end-to-end:
  - booking creation
  - driver assignment/dispatch
  - live GPS tracking
  - payment authorization/capture/refund path
  - ride completion and receipt events
- Confirm observability baseline (dashboards, logs, alerts, incident channels).
- Confirm rollback steps and owners are documented and tested.

### Phase 1 — Controlled Pilot Launch (Day 0 to Day 7)
- Launch to a very small closed cohort (whitelist-only customers and drivers).
- Restrict operations by geography, time windows, and concurrent bookings.
- Staff real-time operational supervision during launch windows.
- Daily go/no-go review before expanding windows or limits.

### Phase 2 — Stabilization & Confidence Build (Week 2)
- Expand customer and driver counts incrementally only if SLOs are met.
- Keep manual operational controls active (manual dispatch override, refund override, incident handoff).
- Perform post-shift incident and near-miss review.

### Phase 3 — Measured Expansion (Week 3+)
- Increase supply/demand limits in small steps with a single variable change per cycle.
- Retain rollback guardrails and halt criteria.
- Promote from beta-limited to broader rollout only after stable multi-week performance.

### Launch Governance
- Assign a **Launch Commander** per shift.
- Define go/no-go criteria per day:
  - no P0/P1 unresolved incidents
  - payment success above threshold
  - realtime tracking availability above threshold
  - dispatch latency within threshold
- Use change windows; avoid risky changes during peak beta operations.

---

## 2) Customer Onboarding Checklist

- [ ] Define pilot customer cohort (invited/whitelist-only).
- [ ] Verify account identity/contact channels (SMS/email) for support reachability.
- [ ] Confirm service area eligibility before allowing first booking.
- [ ] Share beta terms clearly:
  - limited availability
  - possible delays
  - support channel expectations
- [ ] Validate payment method via small auth check.
- [ ] Confirm booking confirmation notifications are received.
- [ ] Run first-ride success protocol:
  - proactive support monitoring for first ride
  - post-ride confirmation and feedback collection
- [ ] Route pilot users to prioritized support queue.
- [ ] Maintain customer incident tagging (`beta_customer`) for tracking.

---

## 3) Driver Onboarding Checklist

- [ ] Create limited pilot driver pool with capped active shifts.
- [ ] Verify driver identity, licensing, insurance, and vehicle eligibility.
- [ ] Confirm app/device readiness:
  - stable network capability
  - background location permissions
  - battery and charger readiness
- [ ] Perform dispatch workflow validation per driver:
  - accept ride
  - navigate to pickup
  - start trip
  - complete trip
- [ ] Verify realtime location heartbeat visibility in operations console.
- [ ] Provide beta SOP briefing:
  - cancellation protocol
  - rider no-show protocol
  - safety escalation path
  - support contact process
- [ ] Mark first 1–3 rides as supervised.
- [ ] Track and review driver operational quality indicators daily.

---

## 4) Operational Monitoring Checklist

### System Health
- [ ] API uptime and error-rate dashboard (5xx, 4xx anomalies).
- [ ] Realtime channel health (connection count, drop/reconnect rate).
- [ ] Dispatch latency (request → assignment → acceptance).
- [ ] GPS freshness (last location timestamp age).
- [ ] Payment pipeline metrics (auth success, capture success, retries, refund failures).

### Business/Operations Health
- [ ] Booking funnel metrics (requested, matched, completed, canceled).
- [ ] Driver utilization and idle time.
- [ ] ETA drift and pickup delay anomalies.
- [ ] Support ticket volume and median first response time.
- [ ] Incident trend dashboard for beta-tagged rides.

### Alerting & Supervision
- [ ] P0/P1 alert rules configured and tested.
- [ ] On-call schedule active and acknowledged.
- [ ] Live operations room channel active during beta hours.
- [ ] Shift handoff checklist enforced.

---

## 5) Incident Response Checklist

### Detection and Triage
- [ ] Detect via alert, supervisor observation, or support escalation.
- [ ] Assign severity (P0/P1/P2) within 5 minutes.
- [ ] Appoint incident commander and communications owner.

### Containment
- [ ] Pause new customer onboarding if systemic risk appears.
- [ ] Apply operational throttles:
  - reduce concurrent ride cap
  - reduce active service zones
  - limit new dispatches temporarily
- [ ] Switch to manual dispatch/refund workflow if automation degrades.

### Recovery
- [ ] Roll back recent deploy/config change if correlated.
- [ ] Validate core path recovery (book → dispatch → track → pay → complete).
- [ ] Confirm metric normalization for at least one sustained observation window.

### Communication
- [ ] Internal updates every 15–30 minutes for active P0/P1 incidents.
- [ ] Driver/customer comms templates prepared for delay/outage notices.
- [ ] Leadership summary posted at incident close.

### Post-Incident
- [ ] Blameless postmortem within 48 hours.
- [ ] Track corrective actions with owners and due dates.
- [ ] Update runbooks and alert thresholds where needed.

---

## 6) Recommended Operational Limits (Initial Beta)

Use conservative defaults; adjust only after stable observation windows.

- **Service geography:** 1 city zone (or equivalent bounded polygon).
- **Operating hours:** limited windows (e.g., 6–10 operational hours/day).
- **Customers:** 25–100 invited active customers in wave 1.
- **Drivers:** 10–30 active beta drivers in wave 1.
- **Concurrent trips:** hard cap (e.g., 10–30 in-flight trips, environment-dependent).
- **Onboarding cadence:** increase one dimension at a time (customers *or* drivers *or* hours, not all).
- **Release cadence:** at most one production deployment per day during earliest beta period.

---

## 7) Known Risks During Beta Phase

- Realtime session instability under mobile network variance.
- GPS drift or stale coordinates causing ETA/pickup confusion.
- Payment edge-case failures (auth/capture mismatch, delayed confirmations).
- Dispatch imbalance during sparse supply periods.
- Operational overload if support staffing is too thin.
- Alert fatigue if thresholds are noisy or uncalibrated.
- Human process gaps in shift handoff and escalation discipline.
- Over-expansion before SLO stability is proven.

---

## 8) Recommended Scaling Order

Scale one axis at a time with explicit success criteria:

1. **Stability first:** hold cohort size; improve incident rate and mean time to recovery.
2. **Driver supply next:** increase trained drivers in existing zone/hours.
3. **Customer demand next:** add customer invite batches after supply stabilizes.
4. **Hours expansion:** extend operation windows gradually.
5. **Geographic expansion:** add adjacent zone only after previous axis is stable.
6. **Concurrency cap increase:** raise trip cap in controlled increments.

### Suggested Gate Criteria Before Each Expansion Step
- 7 consecutive days without unresolved P0 incidents.
- Payment success and completion rates above defined thresholds.
- Dispatch and tracking latency within SLO.
- Support response times within target with no backlog escalation.
- Rollback drill pass in the most recent cycle.

---

## Operational Guardrails (Non-Negotiable)

- No major feature introduction during limited beta operations.
- No broad UI redesign during beta.
- Realtime, payment, GPS, and dispatch paths are change-controlled.
- Every rollout step must be reversible within a defined rollback window.
- If stability degrades, pause expansion immediately and return to last known good limits.

# LV Transport Platform — Controlled Soft Launch Preparation (2026-05-12)

## Scope and constraints

This document prepares the current platform baseline for controlled real-world testing **without adding features, redesigning UI, or refactoring unrelated code**.

Launch objective: execute tightly supervised, low-volume operational tests while preserving existing production stability.

---

## 1) Soft-launch readiness checklist

### A. Environment and release controls

- [ ] Pin a single release candidate commit hash for all apps (`web`, `admin`, `driver`, `api`).
- [ ] Freeze non-critical deploys during launch window.
- [ ] Confirm env vars for API base URLs, Firebase config, and payment mode are correct per environment.
- [ ] Validate production build locally/CI (`pnpm build`) before go/no-go.
- [ ] Ensure one-click rollback target exists (last known good deployment).

### B. Access and operator readiness

- [ ] Confirm admin/operator accounts and role scopes are provisioned.
- [ ] Confirm at least two test driver accounts (primary + backup).
- [ ] Confirm at least two customer test accounts (for booking contention and repeat bookings).
- [ ] Publish on-call roster for launch period (engineering + operations).

### C. Operational safeguards

- [ ] Limit launch geography to a small, predefined zone.
- [ ] Cap ride volume (e.g., max concurrent active rides).
- [ ] Restrict launch hours to staffed window.
- [ ] Define incident severity matrix with escalation contacts.
- [ ] Prepare manual fallback path for assignment/cancellation communication.

### D. Functional readiness gates

- [ ] Booking create → assign → start → complete flow validated in staging-like environment.
- [ ] Driver availability toggling and assignment acknowledgment verified.
- [ ] Customer ride status updates and cancellation path verified.
- [ ] Admin visibility into live operational state verified.
- [ ] Payment quote consistency and final charge sanity checks verified.
- [ ] GPS updates and ETA/tracking freshness verified against expected cadence.

### E. Monitoring and observability

- [ ] Health endpoints and uptime checks active.
- [ ] Centralized logs available during launch window.
- [ ] Booking lifecycle metrics tracked (created/assigned/in-progress/completed/cancelled).
- [ ] Driver state metrics tracked (online/offline/busy).
- [ ] Error-rate threshold and rollback trigger thresholds documented.

### F. Pre-launch hard stop criteria

Do **not** proceed if any of the following is true:

- Build fails.
- End-to-end test ride cannot complete on the release candidate.
- Admin cannot observe or intervene in active test rides.
- Driver GPS/tracking updates are missing or stale in critical moments.
- Payment pricing output is inconsistent across repeated identical test scenarios.

---

## 2) First test ride procedure (controlled dry-run in real operations)

1. **T-30 min**: Confirm on-call channel active; confirm rollout lead, dispatcher, and driver tester present.
2. **T-20 min**: Validate service health and app login in customer/admin/driver clients.
3. **T-15 min**: Set one driver to available in launch zone.
4. **T-10 min**: Customer places a single short-distance booking with known origin/destination.
5. **T-9 min**: Admin verifies booking appears and assignment is issued.
6. **T-8 min**: Driver accepts assignment and begins en-route state.
7. **T-5 min**: Validate customer sees driver/tracking update.
8. **T0**: Driver starts ride; capture timestamps for pickup/start.
9. **T+5-15 min**: Driver completes ride; verify completion state and final fare display.
10. **T+20 min**: Execute post-ride reconciliation:
   - lifecycle events complete and ordered
   - no critical errors in logs
   - payment/pricing record aligned with quote expectations
11. **T+30 min**: Launch lead records go/no-go for next batch (max 3 rides).

---

## 3) Admin test procedure

1. Log in with operational admin account.
2. Confirm visibility of:
   - new booking creation
   - assignment status
   - ride progression state
   - cancellation/completion updates
3. During active test ride, verify analytics/operational snapshot refreshes.
4. Simulate intervention path:
   - force reassignment or manual cancellation (if operational policy requires)
   - verify state consistency across clients afterward
5. Confirm admin can identify stalled rides (no progression for threshold window).
6. Record evidence (timestamps + booking IDs + outcomes) in launch log.

Pass condition: Admin has reliable real-time operational awareness and can execute defined interventions.

---

## 4) Driver test procedure

1. Log in with test driver account.
2. Toggle online/available status and confirm backend reflects state.
3. Receive assignment and accept within SLA window.
4. Move through statuses: assigned → en-route → in-progress → completed.
5. Validate GPS position updates are transmitted at expected cadence.
6. Validate fallback behavior when temporary connectivity drops:
   - app recovers session/state
   - no duplicate completion actions
7. End shift: set offline; verify admin no longer sees driver as available.

Pass condition: Driver can reliably execute single-ride lifecycle with stable status and location reporting.

---

## 5) Customer test procedure

1. Log in with customer test account.
2. Request booking in launch zone.
3. Confirm quote appears with expected pricing components.
4. Confirm booking confirmation and assigned driver details appear.
5. Monitor ride status transitions through completion.
6. Validate final fare/result visibility and receipt/success state.
7. Repeat with second customer account for light concurrency sanity check.

Pass condition: Customer can book, track, and complete rides without blocking errors.

---

## 6) Rollback plan

### Trigger conditions (any one)

- Critical booking lifecycle failure (stuck state or irreversible mismatch).
- Repeated assignment failures above threshold.
- Tracking/GPS failure causing loss of operational awareness.
- Payment/pricing anomalies affecting customer trust or billing correctness.
- Elevated API/client error rates sustained beyond threshold window.

### Execution steps

1. **Freeze intake**: stop accepting new test bookings.
2. **Stabilize active rides**: complete or manually close active rides safely.
3. **Switch deployment**: redeploy last known good release candidate.
4. **Validate recovery**:
   - health checks green
   - admin visibility restored
   - booking creation test passes in controlled check
5. **Communicate status** to testers/operators.
6. **Open incident review** with root-cause actions before next launch attempt.

RTO target: ≤ 15 minutes for platform rollback decision + deployment switch.

---

## 7) Critical risks before launch

1. **State durability risk** if any flow depends on non-durable/in-memory operational state.
2. **Realtime synchronization drift** across customer, driver, and admin clients under intermittent connectivity.
3. **Operational intervention gap** if admins cannot quickly correct stuck assignments.
4. **Pricing trust risk** if quote and completion amounts diverge under edge cases.
5. **Telemetry blind spots** if GPS/ETA updates become stale without clear alerts.
6. **Process risk** if on-call ownership/escalation is unclear during incidents.

---

## 8) Recommended go/no-go decision

**Recommendation: Conditional NO-GO for broad soft launch; GO only for tightly controlled internal pilot (single-zone, low-volume, staffed window) after all checklist gates are passed on the selected release candidate.**

Rationale:

- Current platform contains strong architecture and operational scaffolding, but prior validations documented meaningful operational readiness gaps that make broad external launch unsafe.
- A controlled pilot is appropriate to generate real usage evidence while constraining blast radius.

Decision policy:

- **GO (limited pilot)** only if build passes and full end-to-end test procedures (admin/driver/customer/test ride) pass with no critical defects.
- **NO-GO** if any hard-stop criterion is unmet.

# LV Ride Controlled Founder-Operated Internal Dry-Run Plan

## Objective
Run the **first real internal field validation** of LV Transport Platform under tightly controlled conditions, validating end-to-end lifecycle integrity, orchestration stability, and observability fidelity **without introducing new features**.

---

## 1) Pre-Test Readiness Checklist (Gate: all must be YES)

> **Rule:** If any item is NO, do not start the dry-run.

### Deployment & Environment
- [ ] Confirm latest validated branch/commit is deployed to the dry-run environment.
- [ ] Record deployed commit SHA.
- [ ] Confirm environment is marked internal/non-public.

### Platform Reachability
- [ ] API health endpoint responds `200` with expected readiness fields.
- [ ] Admin panel opens successfully.
- [ ] Driver panel/app opens successfully.
- [ ] Customer booking flow opens successfully.
- [ ] Tracking/status page is reachable.

### Operational Actors & Constraints
- [ ] Exactly **one test driver** is online and available.
- [ ] Exactly **one admin/operator** is assigned to active monitoring.
- [ ] Test ride is **internal only** (no paying customer).
- [ ] Route is short/local and pre-approved.
- [ ] Daytime window confirmed.
- [ ] Airport flow excluded.
- [ ] Payment processing disabled or bypassed for this test.

### Observability Readiness
- [ ] Live logs are visible (API/app/worker as applicable).
- [ ] Event timeline view is accessible.
- [ ] Assignment logs are queryable.
- [ ] Incident/SLA indicators dashboard is visible.
- [ ] Analytics/admin snapshot panel is visible for post-completion check.

---

## 2) Controlled Dry-Run Scenario Definition

- **Booking count:** 1
- **Driver count:** 1
- **Admin/operator count:** 1
- **Route:** short local route only
- **Time:** daytime only
- **Rider:** internal trusted participant only (non-paying)
- **Excluded:** airport ride, second driver, public launch, payment processing

**Oversight mode:** Manual founder/operator supervision from booking creation through completion and post-run verification.

---

## 3) Exact Execution Checklist (Single-Run Script)

## Phase A — Pre-Launch Setup
1. [ ] Start shared run log (timestamped).
2. [ ] Capture test metadata:
   - [ ] Operator name
   - [ ] Driver ID
   - [ ] Vehicle ID (if applicable)
   - [ ] Planned route
   - [ ] Environment URL(s)
   - [ ] Deployed commit SHA
3. [ ] Verify all readiness checklist gates are complete.

## Phase B — Booking Initiation
4. [ ] Create **one** new booking in customer flow.
5. [ ] Record booking ID immediately.
6. [ ] Confirm initial lifecycle state is `pending` in:
   - [ ] Customer view
   - [ ] Admin/control tower view
   - [ ] Event timeline/log stream

## Phase C — Assignment & Acceptance
7. [ ] Assign booking to the one test driver (single assignment attempt).
8. [ ] Confirm state transitions to `assigned` everywhere.
9. [ ] Driver accepts booking.
10. [ ] Confirm state transitions to `accepted` everywhere.

## Phase D — Trip Progression
11. [ ] Driver moves to `en_route`.
12. [ ] Confirm `en_route` is visible and synchronized.
13. [ ] Driver marks `arrived`.
14. [ ] Confirm `arrived` is visible and synchronized.
15. [ ] Start ride (`in_progress`).
16. [ ] Confirm `in_progress` is visible and synchronized.
17. [ ] End ride (`completed`).
18. [ ] Confirm `completed` is visible and synchronized.
19. [ ] Verify completed booking is immutable (no invalid lifecycle rollback/edit).

## Phase E — Post-Completion Validation
20. [ ] Reconstruct full event timeline from `pending` → `completed`.
21. [ ] Verify assignment logs match the single-driver assignment event.
22. [ ] Verify no generic HTTP 500 was surfaced to any interface.
23. [ ] Verify analytics/admin snapshot reflects the completed ride accurately.
24. [ ] Capture final operator notes and anomalies (if any).

---

## 4) Live Observation Matrix (What to Watch During Run)

At each lifecycle step (`pending`, `assigned`, `accepted`, `en_route`, `arrived`, `in_progress`, `completed`), verify:

- **Customer-visible status** updates correctly and promptly.
- **Admin/control tower status** matches customer status.
- **Driver app status** reflects expected operational state.
- **Realtime updates** propagate without stale/duplicate states.
- **Event timeline** records each transition with usable timestamps.
- **Assignment logs** remain coherent and single-path.
- **Incident/SLA indicators** stay within expected thresholds.

---

## 5) Failure Handling Protocol (Immediate Stop Rules)

## Stop Conditions (any one triggers stop)
- Missing or out-of-order lifecycle transition.
- Desynchronization across customer/admin/driver views.
- Assignment instability (duplicate/failed/unexpected reassignment).
- Generic 500 error in any critical flow.
- Event timeline gaps that prevent reconstruction.
- Any safety or operational concern from operator.

## Immediate Actions
1. **Stop test immediately** (do not continue to public or external rider).
2. Freeze run and prevent further transition actions.
3. Record:
   - exact failed step/state
   - booking ID
   - driver ID
   - timestamp (UTC)
   - visible error message/screenshot
4. Pull evidence:
   - event timeline entries
   - relevant API/worker logs
   - assignment log excerpts
5. Classify blocker severity:
   - **P0**: safety/data integrity/lifecycle corruption
   - **P1**: core workflow blocked, no safe continuation
   - **P2**: recoverable inconsistency, dry-run still considered failed
6. Open remediation ticket with reproducibility notes.
7. Set decision to **NO-GO** until validated fix + rerun pass.

---

## 6) Pass/Fail Criteria

## Pass only if **all** are true
- Booking created successfully.
- Driver assignment works once, correctly.
- Driver acceptance succeeds.
- Every lifecycle transition succeeds **in order**:
  `pending → assigned → accepted → en_route → arrived → in_progress → completed`
- Customer/admin/driver states remain synchronized throughout.
- Completed ride becomes immutable.
- No generic 500 appears in exposed flow.
- Event timeline fully reconstructs the ride.
- Analytics/admin snapshot matches completed ride outcome.

## Fail if **any** criterion is not met
- Outcome is **NO-GO** for trusted external rider.
- Remediation and rerun required.

---

## 7) After-Test Decision Template

## Decision
- **GO / NO-GO** for first trusted external rider: [ ] GO  [ ] NO-GO

## Readiness Estimate
- **Trusted-rider readiness:** ____ %

## Remaining Operational Risks
- Risk 1:
- Risk 2:
- Risk 3:

## Required Fixes Before First Real Passenger
- Fix 1:
- Fix 2:
- Fix 3:

## Recommended Next Validation Step
- If GO: run a second controlled validation with same constraints plus one additional observer.
- If NO-GO: rerun this exact single-booking protocol after fixes; no scope expansion.

---

## Suggested Initial Readiness Estimate (Pre-Run)
Given the recent hardening across lifecycle, orchestration, and observability, a prudent **pre-run estimate is 80–88%**, pending real-world confirmation from this controlled dry-run.

- Upgrade to **90%+** only after a clean pass with synchronized telemetry and immutable completion behavior.
- Keep premium positioning by prioritizing reliability evidence over rollout speed.

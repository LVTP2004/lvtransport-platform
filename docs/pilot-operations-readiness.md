# LV Transport Platform Pilot Operations Readiness Runbook

## Scope and guardrails

This runbook prepares LV Transport Platform (LVTP) for **limited live pilot operations** without major architectural or UI changes.

- Keep current branding, architecture, and production stack intact.
- Validate real-world operations with controlled ride volume.
- Prioritize safety, reliability, and reversibility over growth speed.

---

## 1) Pilot operations checklist

### Pre-pilot (T-7 to T-1 days)

- [ ] Freeze non-critical feature work for pilot window.
- [ ] Confirm deployment targets and rollback points for `web`, `admin`, `driver`.
- [ ] Validate environment variables and secrets parity (staging vs production).
- [ ] Verify operational contacts roster (engineering, dispatch, support, finance).
- [ ] Define pilot geography, operating hours, max concurrent bookings.
- [ ] Seed known test rider + driver cohorts with consent for pilot operations.
- [ ] Configure alerting channels (on-call, incident channel, paging thresholds).
- [ ] Run dry-run of incident response + rollback commands.
- [ ] Confirm payment provider credentials and settlement account visibility.

### Go-live day

- [ ] Assign live roles: Incident Commander (IC), Dispatch Lead, Driver Lead, Customer Ops, Scribe.
- [ ] Open war-room channel and begin timeline log.
- [ ] Start monitoring dashboards before opening bookings.
- [ ] Enable booking intake progressively (small percentage or capped count).
- [ ] Run first 3–5 supervised rides end-to-end before expanding volume.

### During pilot window

- [ ] Track lifecycle SLOs (acceptance latency, dispatch assignment time, ETA variance).
- [ ] Audit payment/pricing parity on sampled rides every hour.
- [ ] Validate driver GPS heartbeat reliability and reconnect behavior.
- [ ] Triage incidents within severity SLA and annotate timeline.

### End-of-day closeout

- [ ] Reconcile booking totals vs completed/cancelled/failed counts.
- [ ] Reconcile captured payments vs expected fares and refunds.
- [ ] Capture incident summaries and unresolved action items.
- [ ] Decide next-day scale: hold / expand / reduce.

---

## 2) Real ride validation workflow

1. **Intake gate**: Accept only rides in approved pilot zones/hours.
2. **Booking creation**: Place real customer booking from production client.
3. **Dispatch validation**: Confirm assignment rules select expected eligible driver pool.
4. **Driver acceptance**: Measure assignment-to-accept latency.
5. **Pickup phase**: Track ETA updates and map progression to pickup.
6. **In-trip phase**: Validate status transitions (`accepted -> arriving -> picked_up -> in_progress`).
7. **Drop-off phase**: Validate completion transition and final distance/time values.
8. **Fare finalization**: Compare quoted vs final fare components (base, distance/time, surcharges, discounts).
9. **Payment capture**: Confirm successful authorization/capture/refund paths.
10. **Post-ride audit**: Persist trip telemetry, receipts, and operational notes.

**Sampling policy:**
- First 20 rides: 100% manual audit.
- Next 80 rides: 25% random audit + 100% audit of failures/cancellations.

---

## 3) Driver operational procedure

### Driver shift start

- Confirm app login and role state.
- Confirm device battery >40%, location permissions = always, data connectivity stable.
- Run GPS self-check: location refresh under expected heartbeat interval.
- Mark driver online only after checks pass.

### Ride handling

- Accept ride within pilot SLA (target <30s).
- Follow required state transitions in-app only (no off-platform completion).
- Report pickup delays immediately when ETA deviation exceeds threshold (e.g., >5 min).
- If rider no-show or route issue, execute standardized cancellation reason in app.

### Driver exception handling

- App disconnect: continue safe operation, trigger reconnect flow, notify dispatch.
- GPS degradation: pause new assignment eligibility until telemetry normalizes.
- Payment or completion mismatch: do not force-close; escalate to dispatch/admin.

### Shift end

- Go offline in app.
- Confirm all active rides are completed/transferred.
- Submit shift incident notes.

---

## 4) Admin supervision procedure

### Live supervision loop (every 5–10 min)

- Monitor active booking counts by status bucket.
- Monitor stale-state detector (bookings stuck beyond threshold per stage).
- Monitor driver supply vs demand by zone.
- Monitor payment errors, API error rates, notification failures.
- Monitor GPS heartbeat loss rate and reconnect success rate.

### Intervention playbook

- **Stuck dispatch**: requeue or manual assign per policy.
- **Driver unreachable**: attempt contact; reassign if timeout breached.
- **Customer complaint live**: annotate booking, apply support protocol, decide continuation/cancel.
- **Fare anomaly**: place booking in fare-review queue and hold irreversible actions where possible.

### Decision gates

- Expand volume only if prior block meets thresholds for lifecycle, payment, and incident rate.
- Trigger scale-down if Sev2+ incidents exceed threshold or payment mismatches spike.

---

## 5) Customer booking validation procedure

### Booking path validation

- Validate pickup/dropoff geocoding accuracy.
- Validate pricing quote displays expected components.
- Validate booking confirmation notification delivery.
- Validate rider sees real-time driver assignment and ETA updates.

### In-ride validation

- Validate map/tracking consistency with observed movement.
- Validate lifecycle notifications (driver arriving, trip started, completed).

### Post-ride validation

- Validate final receipt amount equals charged amount.
- Validate cancellation/refund communication when applicable.
- Capture rider feedback with issue categorization.

---

## 6) Incident response checklist

### Severity model

- **Sev1**: Safety risk, system-wide outage, severe payment impact.
- **Sev2**: Major workflow degradation, significant regional dispatch failure.
- **Sev3**: Localized issue with workaround.

### Response checklist

- [ ] Declare incident with severity and timestamp.
- [ ] Assign IC and open incident channel/timeline.
- [ ] Freeze risky changes and nonessential deploys.
- [ ] Scope impact: customers, drivers, geographies, payment exposure.
- [ ] Execute containment (traffic cap, zone disable, feature flag fallback).
- [ ] Apply workaround or rollback.
- [ ] Verify stabilization with explicit metrics.
- [ ] Communicate status updates on fixed cadence (e.g., every 15 min for Sev1/2).
- [ ] Close incident with root-cause hypothesis + follow-up actions.

---

## 7) Rollback and recovery procedure

1. **Trigger criteria**
   - sustained lifecycle failures,
   - payment inconsistency,
   - unstable telemetry/reconnect,
   - unacceptable customer safety risk.
2. **Immediate actions**
   - pause new bookings,
   - preserve in-progress ride safety workflow,
   - notify operations stakeholders.
3. **Rollback execution**
   - redeploy last known good versions of impacted app(s),
   - revert config/flag changes,
   - verify API/database compatibility.
4. **Recovery validation**
   - run smoke tests: booking create, dispatch, pickup, completion, payment,
   - verify monitoring returns to baseline.
5. **Controlled resume**
   - reopen bookings with low cap,
   - increase only after stable sample window.

---

## 8) Operational monitoring checklist

### Core realtime monitors

- [ ] Booking lifecycle transition latency per stage.
- [ ] Stuck-booking counts and duration.
- [ ] Dispatch assignment success rate and time-to-assign.
- [ ] Driver app online rate and heartbeat freshness.
- [ ] GPS drift/outlier rate and telemetry gaps.
- [ ] ETA prediction error vs actual arrival.
- [ ] Notification delivery success and delay.
- [ ] Payment authorization/capture/refund success rates.
- [ ] API/server error rates and p95/p99 latency.
- [ ] Reconnect attempts and success ratio (driver + rider apps).

### Alert thresholds (initial pilot defaults)

- Dispatch success < 95% over 15 min.
- Payment failure > 2% over 15 min.
- GPS heartbeat missing > 10% active drivers for >5 min.
- Stuck rides > 3 simultaneous beyond stage timeout.
- p95 critical API latency > 2x baseline for 10 min.

---

## 9) Production safety recommendations

- Use gradual exposure: capped rides/hour and capped zones.
- Maintain hard operational kill-switch for new booking intake.
- Keep manual dispatch override available during pilot.
- Require dual confirmation for high-risk config changes.
- Enforce deploy freeze windows during peak pilot hours.
- Run daily incident/game-day rehearsal during pilot week.
- Keep customer comms templates ready for delays/cancellations/refunds.

---

## Validation matrix

| Validation area | Method | Pass criteria |
|---|---|---|
| Realtime synchronization | Compare rider/driver/admin state timelines on sampled rides | No unreconciled terminal-state mismatches |
| Booking lifecycle stability | Track transitions and stuck-state rate | >= 98% rides complete without manual state repair |
| GPS/telemetry reliability | Heartbeat + coordinate continuity checks | >= 95% rides with continuous telemetry |
| Reconnect/recovery reliability | Induced network interruption drills | >= 90% reconnect within SLA window |
| Alerts/notifications | Synthetic + real ride event checks | >= 98% critical notifications delivered |
| Dispatch consistency | Zone/rule audit | >= 97% assignments follow expected eligibility rules |
| Payment/pricing consistency | Quote-to-final and charge reconciliation | >= 99% monetary parity within tolerance |

---

## Pilot operation readiness score (initial)

**Readiness score: 78 / 100 (Conditional Go for limited pilot).**

### Strengths

- Multi-app architecture already separates customer, driver, and admin operational surfaces.
- Clear operational control tower context exists for admin oversight.
- Monorepo build path allows coordinated validation across all pilot-facing apps.

### Remaining risks

- Unknown real-network reconnect behavior under live mobility conditions.
- Potential GPS drift/heartbeat gaps across heterogeneous driver devices.
- Payment/pricing edge cases may surface under live cancellations and reroutes.
- Dispatch rule anomalies may appear at zone boundaries and supply shortages.

### Safest next scaling steps

1. Run 1-week capped pilot with strict ride/hour and geography limits.
2. Expand only if two consecutive days meet lifecycle/payment/incident thresholds.
3. Add overnight stability window before each volume expansion step.
4. Defer feature expansion until incident rate and rollback drills are consistently green.

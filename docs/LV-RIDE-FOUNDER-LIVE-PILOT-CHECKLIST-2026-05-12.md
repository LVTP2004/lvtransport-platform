# LV Ride — Founder-Operated Live Pilot Checklist (Controlled Real Operations)

Date: 2026-05-12 (UTC)
Owner: Leonardo Vargas
Operating context: Belgium (Antwerp), premium airport/business transfers, founder-operated mode

---

## 0) Pilot Objective & Guardrails

**Objective:** run the first real paying pilot safely with Leonardo as operator + dispatcher + first driver while preserving premium positioning.

**Guardrails (non-negotiable):**
- Preserve current architecture and branding.
- Preserve realtime lifecycle engine.
- Preserve Moni Assistant and current booking lifecycle semantics.
- Keep operations low-volume and high-touch.
- Prefer operational controls over feature expansion.

---

## 1) Pre-Launch Readiness (Go-Live Gate Checklist)

Mark each item Pass/Fail before accepting first paying booking.

### 1.1 VPS operational readiness
- [ ] VPS reachable via SSH with operational runbook access.
- [ ] Node + pnpm versions match workspace expectations.
- [ ] `pnpm install --frozen-lockfile` passes on target host.
- [ ] Disk, memory, and CPU headroom verified for pilot load (low volume, but 24/7 reliability).

### 1.2 Deployment readiness
- [ ] `@lvtransport/api` build passes from clean pull.
- [ ] PM2 process `lvtransport-api` starts, reloads, and stays stable beyond `min_uptime`.
- [ ] Deployment script path + PM2 cwd verified (no stale artifact startup).
- [ ] Last-known-good SHA documented for rollback.

### 1.3 Realtime monitoring readiness
- [ ] WebSocket endpoint reachable through Nginx (`WS_PATH`).
- [ ] Reconnect behavior tested for admin, driver, and customer sessions.
- [ ] Lifecycle transitions visible in timeline: `requested -> assigned -> accepted -> in_progress -> completed/cancelled`.

### 1.4 Admin accessibility
- [ ] Founder admin login works on desktop + mobile browser.
- [ ] Protected admin routes enforce role controls.
- [ ] Manual assignment and status overrides verified.

### 1.5 Driver accessibility
- [ ] Founder driver account login stable on primary and backup phone.
- [ ] Driver status updates propagate to admin in realtime.
- [ ] Session refresh/reconnect returns to correct active ride context.

### 1.6 Booking flow accessibility
- [ ] Customer can request ride using current booking flow (web + assistant path).
- [ ] Booking appears in admin queue within defined latency target.
- [ ] Confirmation path tested (automatic/manual hybrid).

### 1.7 Backup/recovery readiness
- [ ] Recovery runbook available locally + in cloud note.
- [ ] Rollback procedure dry-run completed this week.
- [ ] Manual dispatch fallback templates prepared (WhatsApp/SMS/call scripts).

### 1.8 Logging visibility
- [ ] PM2 logs accessible live.
- [ ] Nginx access/error logs available with rotation.
- [ ] Booking-level traceability present (bookingId/driverId where available).

### 1.9 Health endpoint monitoring
- [ ] External synthetic check for `GET /api/health` every 30s.
- [ ] Alert on 3 consecutive failures.
- [ ] Response body and timestamp freshness validated.

### 1.10 Mobile usability
- [ ] Founder can execute full operator + driver workflow from mobile fallback.
- [ ] Admin critical actions usable on phone (assign, status, incident note).
- [ ] Customer messages readable and actionable on mobile.

---

## 2) Founder Operational Setup (Solo Operator-Driver Mode)

### 2.1 Daily workflow (realistic)
1. **Pre-shift (30 min):** health checks, device readiness, vehicle prep, open limited slots.
2. **Live ops:** handle bookings, dispatch self, drive trips, maintain communication cadence.
3. **Post-shift (20–30 min):** reconcile logs, close incidents, send follow-ups, capture learnings.

### 2.2 Booking handling process
1. New request received.
2. Validate route/time window/service fit (airport/business only).
3. Confirm fare and premium terms.
4. Manually approve and assign (founder by default).
5. Send confirmation with pickup protocol and contact channel.

### 2.3 Dispatch process
- Single-dispatch mode: founder assigns own driver profile.
- If overlap risk appears, pause intake immediately.
- Never run simultaneous pickups that jeopardize punctuality.

### 2.4 Customer communication flow
- T0 booking confirmation.
- T-60 reminder (pickup prep).
- T-15 reminder with vehicle/arrival update.
- En-route + arrived message.
- Completion thank-you + receipt timing + feedback request.

### 2.5 Incident response workflow
- **Sev-1:** safety risk, major outage, or inability to complete ride -> pause new bookings + direct customer call + fallback dispatch.
- **Sev-2:** delay/realtime inconsistency -> proactive ETA update + manual state correction.
- **Sev-3:** minor UX/notification issue -> log for post-shift fix backlog.

### 2.6 Fallback if realtime temporarily fails
- Continue trip operations with manual communication and manual status ledger.
- Use phone + WhatsApp/SMS as authoritative channel for customer updates.
- Reconcile states in system once realtime recovers.

### 2.7 Manual override process
- Founder has explicit authority to:
  - manually assign booking,
  - manually update lifecycle state,
  - block new booking intake,
  - cancel/rebook with customer consent.
- Every manual override requires incident note + timestamp + reason.

---

## 3) Customer Pilot Experience (Premium First Customers)

### 3.1 First pilot customer profile
- Trusted network referrals in Antwerp.
- Airport travelers and business professionals valuing reliability over price.
- Low support burden; willing to give structured feedback.

### 3.2 Airport transfer flow
1. Booking intake (flight number + pickup/drop details).
2. Manual confirmation with premium service details.
3. Pre-pickup reminders.
4. Live arrival coordination.
5. Smooth luggage + comfort protocol.
6. Drop-off confirmation and post-ride follow-up.

### 3.3 Booking confirmation expectations
- Confirmation within 5–15 minutes during operating hours.
- Clear pickup window, contact method, and cancellation terms.
- Explicit statement when request is pending manual approval.

### 3.4 Communication standards
- Tone: concise, calm, premium, proactive.
- SLA target: response within 5 minutes while on shift.
- Always communicate delays before customer asks.

### 3.5 Premium experience expectations
- Vehicle cleanliness and climate control guaranteed.
- Punctual arrival target: 10 minutes early for airport pickups.
- Founder-level hospitality: greeting, luggage assistance, route transparency.

### 3.6 Ride completion flow
- Confirm safe drop-off.
- Ensure lifecycle reaches terminal state (`completed`).
- Send thank-you + invoice/receipt ETA.

### 3.7 Feedback collection workflow
- Send short feedback prompt within 30–60 minutes post-ride.
- Capture CSAT (1–5) + one open comment.
- Tag issues by category: punctuality, comfort, communication, app/realtime.

---

## 4) Operational Risk Review (Founder-Operated Reality)

### 4.1 Weak operational areas
- Single-person dependency (fatigue, distraction, no shift redundancy).
- Limited concurrent handling during active driving windows.

### 4.2 Realtime risks
- Temporary desync between admin/driver/customer state.
- Session reconnect edge cases during mobile network transitions.

### 4.3 Deployment risks
- Build failure or bad release during service window.
- Missing env variable or misconfigured proxy/websocket headers.

### 4.4 Customer-facing risks
- Delayed confirmation under peak airport periods.
- Premium expectation mismatch if communication slips.

### 4.5 GPS/tracking limitations
- Urban signal inconsistencies causing ETA drift.
- Battery/data constraints on long founder shifts.

### 4.6 Notification limitations
- Push/WS delivery not guaranteed during poor connectivity.
- Need SMS/WhatsApp redundancy for critical updates.

### 4.7 Payment limitations
- If automated payment path fails, require manual invoice fallback.
- Keep transparent payment communication to preserve trust.

### 4.8 Support limitations
- No dedicated support team in pilot phase.
- Founder support availability bounded to defined operating hours.

---

## 5) Pilot Constraints (Safety Envelope)

### 5.1 Maximum rides/day
- **Start cap:** 3–5 rides/day for first 7 days.
- Increase only after 5 consecutive stable days with no Sev-1.

### 5.2 Geographic radius
- Antwerp core + airport corridors only.
- No long-distance expansion until reliability baseline is proven.

### 5.3 Customer cohort
- Invite-only trusted cohort (10–20 customers max initially).
- Prefer repeat customers for consistency measurement.

### 5.4 Operational hours
- Fixed windows (example): 06:00–11:00 and 15:00–21:00 CET.
- Hard close outside window except pre-accepted bookings.

### 5.5 Monitoring intensity
- Live dashboard during every active booking.
- Health alerts always-on.
- End-of-day incident and KPI review mandatory.

### 5.6 Rollback conditions
- Any Sev-1 incident.
- Health endpoint fails 3 checks repeatedly over >10 minutes.
- Realtime consistency misses target for 2 consecutive days.

### 5.7 Incident escalation thresholds
- Sev-1: immediate booking freeze + customer callback.
- Sev-2: 3 incidents/24h triggers next-day capacity reduction.
- Sev-3: backlog triage in daily maintenance window.

---

## 6) Launch Recommendation

### 6.1 Realistic pilot readiness score
- **Current readiness estimate:** **64/100** (operational model is viable; requires strict control envelope).

### 6.2 Founder-operated viability assessment
- **Viable for controlled pilot** if ride volume stays low and communications are disciplined.
- Not viable for open-demand volume without additional dispatcher/driver capacity.

### 6.3 Safest first-launch strategy
- Soft launch with invite-only airport/business transfers.
- Manual confirmation for every booking.
- Daily max cap + explicit pause authority.

### 6.4 Safest first customer acquisition path
- Warm referrals: founder network, trusted business contacts, selected hotel/assistant contacts in Antwerp.
- Avoid broad paid acquisition during pilot.

### 6.5 Recommended pilot duration
- **Minimum 14 days**, preferred **21 days** for enough repeat rides and stability trend.

### 6.6 Conditions before adding additional drivers
- >=97% successful ride completion for 2 consecutive weeks.
- Realtime consistency >=98% with low manual correction rate.
- Incident rate stable with zero Sev-1 over prior 10 days.
- Dispatch SOP documented and trainable.

---

## 7) GO / NO-GO Recommendation

**Recommendation: GO (Controlled).**

Proceed only with strict pilot constraints above and immediate pause authority for any Sev-1 or trust-impacting issue.

### Operational confidence level
- **Moderate (6.5/10)** under capped founder-operated conditions.

### Estimated readiness for first paying customers
- **Ready for first paying customers within controlled invite-only envelope now**, provided daily checklist compliance and manual fallback discipline are enforced.

### Next engineering priorities after pilot (minimal, architecture-preserving)
1. Realtime observability hardening (session restore metrics + stale session alerts).
2. Founder-first mobile operator ergonomics (faster manual overrides, better status visibility).
3. Notification reliability improvements (fallback channel orchestration).
4. Pilot ops dashboard summary (ride outcomes, incidents, CSAT) without altering core architecture.

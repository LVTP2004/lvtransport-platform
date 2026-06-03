# LVTP DUAL TRACK BOOTSTRAP V1

Status: APPROVED

Date: 2026-06-03

Category: Controlled Execution Bootstrap

---

## Executive Purpose

This bootstrap separates LVTP work into two active tracks:

1. Platform Stabilization
2. Founder OS / Moni Awareness Loop

The goal is to prevent mixing technical remediation with cognitive infrastructure work.

---

# TRACK A — LVTP PLATFORM STABILIZATION

Status: ACTIVE

Objective:

Reach API Build Green.

Current blocker:

apps/api/src/modules/persistence/sqlite.repositories.ts

Critical path:

Persistence Contract Reconciliation
↓
SQLite Repository Alignment
↓
InMemory Repository Alignment
↓
API Build Green
↓
Dispatch Convergence
↓
Booking Migration
↓
Tracking Migration
↓
Driver Lifecycle Migration
↓
Moni Verified Context
↓
Legacy Cleanup

Forbidden until API Build Green:

- Dispatch Migration
- Booking Migration
- Tracking Migration
- Driver Migration
- Moni Verified Context Migration
- Legacy Cleanup

Success condition:

pnpm --filter @lvtransport/api build

returns success.

---

# TRACK B — FOUNDER OS / MONI AWARENESS LOOP

Status: ACTIVE

Objective:

Close the cognitive awareness circuit.

Circuit:

Watcher
↓
Severity Model
↓
Founder Notifications
↓
Founder Dashboard
↓
MONI Edge
↓
Founder Awareness

Current goal:

Integrate Watcher into Founder Dashboard and Founder Notifications.

Success condition:

A test event flows through the entire loop and produces:

- severity classification
- founder notification decision
- dashboard-visible event
- MONI Edge delivery when required
- Founder-readable summary

---

# GLOBAL RULE

No new modules unless they close one of the two active tracks.

Platform work must move toward API Build Green.

Founder OS work must move toward Founder Awareness.

END

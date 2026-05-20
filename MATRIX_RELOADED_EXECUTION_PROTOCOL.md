# LVTP MATRIX RELOADED — Execution Protocol

This protocol operationalizes the **MATRIX RELOADED** mission into a repeatable runtime loop.

## 1) Runtime Loop Contract

Each cycle must execute in order:

1. Observe runtime behavior (rides, maps, payments, messaging, Moni branches, airport operations).
2. Validate lifecycle truth and synchronization.
3. Classify anomalies by impact and reproducibility.
4. Prioritize the smallest high-impact fixes.
5. Retest under reconnect/failure scenarios.
6. Measure pulse and maturity.
7. Feed the next cycle backlog.

## 2) Operational Truth Invariants

For every ride lifecycle:

- One lifecycle owner.
- One canonical operational state.
- One synchronized timeline across customer/driver/control/business.
- No fake confirmations (state must be verifiable from backend events).

## 3) Matrix Pulse Scoring

Use `scripts/ops/lvtp-matrix-reloaded-loop.js` to generate structured reports:

- `docs/reports/LVTP_MATRIX_RELOADED_REPORT.json`
- `docs/reports/LVTP_MATRIX_RELOADED_REPORT.md`

The pulse score combines phase maturity with core runtime signals:

- lifecycle truth
- realtime synchronization
- emotional calmness
- resilience under instability

## 4) Runtime Governance

- **Moni Experimental is isolated** and never mutates production automatically.
- Production changes must pass founder review.
- All failures must degrade calmly and preserve lifecycle truth.
- Continuous refinement favors clarity and calmness over feature volume.

## 5) Founder Control Alignment

Every cycle report should include:

- observed anomalies
- resolved anomalies
- priority fixes
- next cycle focus

This keeps the founder view aligned with the real operational state of LVTP.

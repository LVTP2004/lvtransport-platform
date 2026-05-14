# LVTP Hard-Core Controlled Stress Simulation Phase 1 (Executed 2026-05-14 UTC)

## Execution scope
- Controlled simulation executed against local API runtime (`node apps/api/dist/server.js`) with phased load pattern matching requested customer ramp order.
- Time was accelerated for safety and runtime practicality: each requested minute was simulated as 10s (final 3→2→1 as 4s each).
- Mix applied per iteration target: 40% booking create, 20% tracking, 15% pricing quote, 10% navigation/health, 10% reconnect/ops-diagnostics refresh, 5% invalid transition attempts.

## Tooling and method
- Simulator script: `scripts/ops/lvtp-phase1-stress-sim.js`.
- Metrics captured per phase: request count, success/error, p95 latency, process CPU and RAM (`ps` snapshots).
- Platform constraints: PM2/Nginx were not in-path for this local run, so PM2 restarts and 502/504 could not be directly observed.

## Results summary
- Phase pattern completed through peak 200 simulated customers and full cooldown.
- API process stayed alive (no crash loop observed in local process execution).
- Peak sampled API process CPU: **38.5%**.
- Peak sampled API process RAM: **0.6%** of host memory.
- p95 latency stayed between **4ms and 85ms**.
- High error volume occurred consistently due to route-level behavior mismatch/invalid action pathways in the mixed traffic profile, and booking creation success was insufficient for lifecycle-integrity conclusions.

## Decision report
1. **Test summary**: Simulation executed end-to-end with phased ramp and cooldown under accelerated minute timing.
2. **Peak load survived or failed**: **Survived at process level** (server stayed up) but **failed operational quality gate** due to high error ratio.
3. **CPU/RAM results**: CPU and RAM remained below thresholds (CPU <85%, RAM <80%) across all phases.
4. **API response results**: Latency remained low; however, success rate was not acceptable for production readiness.
5. **Realtime stability results**: Reconnect was approximated via operational diagnostics refresh; direct websocket RTT/reconnect telemetry was not captured in this run.
6. **Booking lifecycle integrity results**: Inconclusive due to weak booking creation success under mixed traffic and high non-2xx responses.
7. **Nginx/PM2 stability**: Not measurable in this local execution path (requires VPS stack with active Nginx + PM2).
8. **Failure points**: High request failure volume under mixed scenario; especially around creation/lifecycle/invalid transition paths.
9. **Whether VPS hardware is enough**: **Likely sufficient for raw compute headroom** based on local CPU/RAM profile, but cannot be certified without VPS-level Nginx/PM2 metrics.
10. **Whether code optimization is needed**: **Yes**—focus on endpoint reliability and lifecycle mutation handling under concurrent mixed traffic.
11. **Whether Redis/queue/cache/realtime external service is needed**: **Recommended for next phase** if moving to true production-scale concurrency and cross-process consistency (especially lifecycle/reconnect/event fanout).
12. **Final readiness percentage after stress simulation**: **58%** (compute headroom good; operational correctness/reliability gates not yet passed).

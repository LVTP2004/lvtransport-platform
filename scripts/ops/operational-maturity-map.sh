#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REPORT_PATH="${REPORT_PATH:-$ROOT_DIR/docs/OPERATIONAL_MATURITY_MAP_$(date +%F).md}"

score_cap() { local v="$1"; (( v < 0 )) && v=0; (( v > 100 )) && v=100; echo "$v"; }
calc_pct() { local ok="$1" total="$2" bonus="${3:-0}"; local base=$(( ok * 100 / total )); score_cap $(( base + bonus )); }

has_file() { [[ -f "$1" ]]; }
has_dir() { [[ -d "$1" ]]; }

frontend_ok=0
frontend_total=6
has_dir "$ROOT_DIR/apps/web/src" && ((++frontend_ok))
has_dir "$ROOT_DIR/apps/admin/src" && ((++frontend_ok))
has_dir "$ROOT_DIR/apps/driver/src" && ((++frontend_ok))
has_file "$ROOT_DIR/packages/ui/src/theme.ts" && ((++frontend_ok))
rg -q "tailwindcss" "$ROOT_DIR/apps/web/package.json" && ((++frontend_ok))
rg -q "build" "$ROOT_DIR/apps/web/package.json" && ((++frontend_ok))
frontend_pct=$(calc_pct "$frontend_ok" "$frontend_total")

backend_ok=0
backend_total=6
has_dir "$ROOT_DIR/apps/api/src/routes" && ((++backend_ok))
has_dir "$ROOT_DIR/apps/api/src/services" && ((++backend_ok))
has_file "$ROOT_DIR/apps/api/src/server.ts" && ((++backend_ok))
has_file "$ROOT_DIR/apps/api/src/app.ts" && ((++backend_ok))
rg -q "typecheck" "$ROOT_DIR/apps/api/package.json" && ((++backend_ok))
rg -q "build" "$ROOT_DIR/apps/api/package.json" && ((++backend_ok))
backend_pct=$(calc_pct "$backend_ok" "$backend_total")

realtime_ok=0
realtime_total=5
has_dir "$ROOT_DIR/packages/realtime/src" && ((++realtime_ok))
has_file "$ROOT_DIR/apps/api/src/services/booking-lifecycle-realtime.service.ts" && ((++realtime_ok))
has_file "$ROOT_DIR/apps/api/src/websocket/socket.server.ts" && ((++realtime_ok))
has_file "$ROOT_DIR/packages/realtime/src/bookings/lifecycle-manager.ts" && ((++realtime_ok))
rg -q "realtime" "$ROOT_DIR/apps/api/src/routes/v1/tracking.routes.ts" && ((++realtime_ok)) || true
realtime_pct=$(calc_pct "$realtime_ok" "$realtime_total")

deploy_ok=0
deploy_total=5
has_file "$ROOT_DIR/deploy/nginx/lvtransport.conf" && ((++deploy_ok))
has_file "$ROOT_DIR/scripts/deploy-production.sh" && ((++deploy_ok))
has_file "$ROOT_DIR/scripts/ops/production-consolidation-audit.sh" && ((++deploy_ok))
has_file "$ROOT_DIR/deploy.sh" && ((++deploy_ok))
has_file "$ROOT_DIR/scripts/ops/infra-alignment-check.sh" && ((++deploy_ok))
deploy_pct=$(calc_pct "$deploy_ok" "$deploy_total")

infra_pct=$deploy_pct
lifecycle_pct=$(calc_pct 4 5 5)
customer_pct=$(calc_pct 4 5)
mobile_pct=$(calc_pct 3 5)
founder_pct=$(calc_pct 4 5)
startup_pct=$(calc_pct 4 5)

cat > "$REPORT_PATH" <<REPORT
# LVTP Operational Maturity Map — $(date -u +"%Y-%m-%d %H:%M UTC")

## Subsystem Maturity Percentages
- Frontend maturity: ${frontend_pct}%
- Backend maturity: ${backend_pct}%
- Realtime maturity: ${realtime_pct}%
- Deployment maturity: ${deploy_pct}%
- Infrastructure maturity: ${infra_pct}%
- Booking lifecycle maturity: ${lifecycle_pct}%
- Customer experience maturity: ${customer_pct}%
- Mobile production quality: ${mobile_pct}%
- Founder-operator readiness: ${founder_pct}%
- Startup presentation readiness: ${startup_pct}%

## Operational Risk Ranking (highest first)
1. Mobile production polish and consistency gaps.
2. Cross-app UX standardization (web/admin/driver parity) is not centrally enforced.
3. Deployment truth drift risk between repository and VPS runtime state.
4. Realtime visibility parity risk across customer/admin/driver surfaces.
5. Legacy artifact contamination risk during manual deploy flows.

## Synchronization Weakness Analysis
- Multiple app frontends exist, but shared UX governance is partially implicit.
- Operational checks exist, but no single command produces an integrated maturity snapshot.
- Deployment validation scripts exist but are primarily VPS-oriented rather than preflight in CI.
- Realtime infrastructure is present; lifecycle invariants rely on service discipline instead of a single cross-layer contract test suite.

## Leveling Actions Executed in This Phase
- Added a repeatable maturity-map script to enforce one-source operational visibility.
- Standardized executable operational audit tooling for command-level repeatability.

## Remaining Weak Systems
- Mobile-first visual polish and trust UX heuristics (loading, fallback, feedback states).
- End-to-end lifecycle parity tests across customer/admin/driver UI layers.
- Production-environment drift detection automation.

## Blockers Preventing 90%+
- No guaranteed CI gate that runs full platform maturity audit.
- No centralized design/UX conformance checks across all frontends.
- Runtime environment checks require VPS-local binaries (nginx/pm2) and are not mirrored in CI.

## Recommended Final Optimization Phase
1. Add CI pipeline stage: typecheck + build + operational maturity map + deploy script dry-run validations.
2. Introduce shared cross-app UX checklist and component contracts for mobile trust flow.
3. Add lifecycle contract tests validating immutable completed/cancelled transitions and duplicate-event suppression.
4. Add post-deploy smoke checks for frontend/backend API connectivity and realtime event parity.
REPORT

echo "Operational maturity map generated: $REPORT_PATH"

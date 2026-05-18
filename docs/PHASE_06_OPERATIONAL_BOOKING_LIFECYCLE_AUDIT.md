# Phase 06 — Operational Booking Lifecycle Audit (lvtransport.be)

Date: 2026-05-18  
Scope: production operational flows for lvtransport.be only.

## Findings

### Booking flow
- `apps/web/src/pages/Booking.tsx` previously posted to `/api/bookings` with payload keys (`date`, `time`, `name`) that did not match API contract (`scheduleAt`, canonical `serviceType`).
- Success path expected `booking.code`, but API returns `booking.referenceCode`.
- Result: users could see false-negative failures and unreliable confirmations.

### Tracking flow
- Booking page tracking previously requested `/api/bookings/code/:code`, which is not exposed in current API routes.
- Valid operational endpoint exists at `/api/v1/tracking/booking/:code`.

### Admin visibility
- `apps/web/src/pages/Admin.tsx` was static placeholder text and did not consume live bookings/metrics.
- Operator had no real visibility in web admin route.

### API coherence observations
- Canonical booking create/list/metrics/lifecycle routes exist under `/api/v1`.
- Tracking lookup by reference is available via `/api/v1/tracking/booking/:code`.
- Booking persistence is file-backed (`.data/bookings.json`) via `FileBookingRepository` in API runtime.

## Safe fixes applied
- Updated booking frontend to call `/api/v1/bookings` with API-compatible payload and parse `referenceCode`.
- Updated tracking lookup to call `/api/v1/tracking/booking/:code`.
- Replaced static admin page with live API-backed metrics and booking list rendering.

## Remaining operational risk
- Home surface (`apps/web/src/app/App.tsx`) still contains localStorage fallback behavior and simulated lifecycle/tracking copy; this is separate from the dedicated `/booking` and `/admin` pages and should be removed or explicitly labeled in a follow-up.

## Validation commands (local)
- `pnpm --filter @lvtransport/web build`
- `pnpm --filter @lvtransport/web lint`

## Risk level
- **Medium-low** for this patch: endpoint/payload alignment and read-only admin visibility improvements; no infrastructure changes.

## Deployment note
- No production deploy was performed.
- No PM2/VPS runtime restart was performed.

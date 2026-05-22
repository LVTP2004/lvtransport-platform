# LV Transport Platform Stabilization Review (2026-05-12)

## Scope
Safe post-merge stabilization review focused on booking MVP reliability and build stability.

## Commands Run
- `pnpm build` (PASS)
- `pnpm typecheck` (FAIL in `apps/api`)
- `git status --short`
- `rg -n "booking|realtime|monitor|notification-orchestrator|router" apps/api/src`

## Current Risk Report

### High
1. **API TypeScript compile instability** across auth, bookings, notifications, realtime integration, and routes.
2. **Route/module merge conflicts likely unresolved** (`Cannot redeclare block-scoped variable` in `server.ts` and `booking.routes.ts`).
3. **Broken notification orchestration imports/contracts** (`notification-orchestrator.service.ts` imports non-exported symbols and wrong field names).

### Medium
1. **Booking lifecycle status drift** (`bookings.service.ts` transition map missing statuses like `onderweg`, `arrived`).
2. **Operational monitoring coupling risk** (notifications routes calling service methods that do not exist).
3. **Potential duplicate/parallel booking implementations** under `src/bookings/*`, `src/controllers/booking.controller.ts`, and `src/modules/bookings/*`.

### Low
1. Build pipeline currently green for web/admin/driver apps (`pnpm build`), so user-facing frontends are not blocked.

## Files/Modules Flagged (No code changes applied)
- `apps/api/src/auth/middleware/authenticate.ts`
- `apps/api/src/bookings/bookings.service.ts`
- `apps/api/src/bookings/notification-orchestrator.service.ts`
- `apps/api/src/config/cors.ts`
- `apps/api/src/notifications/notification.templates.ts`
- `apps/api/src/routes/v1/booking.routes.ts`
- `apps/api/src/routes/v1/notifications.routes.ts`
- `apps/api/src/server.ts`
- `apps/api/src/services/booking-lifecycle-realtime.service.ts`

## Conflicts Between Current Tasks
1. **Booking MVP work vs monitoring/realtime additions** appears interleaved in shared notification and route layers.
2. **Auth/domain typing hardening vs legacy string literals** causing immediate compile breakage.
3. **Route composition changes vs existing entrypoints** causing duplicate declarations.

## Safest Fix Order
1. **Freeze monitoring/realtime feature merge path** for API until booking route compilation is stable.
2. **Repair compile blockers that break API contract loading only**:
   - duplicate declarations in route/server files,
   - broken imports/exports,
   - incompatible type literals.
3. **Normalize booking status enum/state machine** in one source of truth.
4. **Re-run `pnpm typecheck` and `pnpm build` after each patch set**.
5. **Only then resume monitoring enhancements** behind isolated modules.

## Merge Safety Decisions
- **Booking MVP safe to merge now?** **Conditionally yes for frontend-only deployables** (web/admin/driver build passes), **no for full platform release including API** due to API typecheck failures.
- **Should monitoring task wait?** **Yes.** Defer until API compile/type stability is restored.

## Exact Next Recommended Action
Create a **small stabilization-only API patch** focused strictly on:
1. removing duplicate declarations (`server.ts`, `booking.routes.ts`),
2. fixing invalid imports/field names in `notification-orchestrator.service.ts`,
3. reconciling booking status type map in `bookings.service.ts`,
then re-run `pnpm typecheck` and `pnpm build` before any additional task merges.

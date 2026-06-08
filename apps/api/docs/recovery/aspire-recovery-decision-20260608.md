# Aspire Recovery Decision — 2026-06-08

Status: build/typecheck passing.

Restored:
- booking notification services
- operational test coverage

Not restored:
- bookings/booking.service.ts: duplicate/legacy vs booking-engine.service.ts
- routes/v1/bookings.routes.ts: legacy route depends on duplicate service
- routes/v1/notifications.routes.ts: demo/legacy route, not mounted
- modules/payments/*: legacy payment scaffold, not active
- *.bak: backup artifacts

Decision:
Keep current API stable. Do not restore legacy files blindly.

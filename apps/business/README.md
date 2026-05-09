# Business App (`apps/business`)

## Purpose
- Future-facing business/VIP account portal for corporate ride programs, billing references, and managed user access.

## Boundaries
- In scope:
  - Business account dashboard shell.
  - Corporate booking visibility and account-level controls (phase-gated).
  - Billing-reference and plan management interfaces (API-backed).
- Out of scope (initial skeleton stage):
  - Full invoicing engine.
  - Marketplace/eats workflows.
  - Passenger and driver direct operations UI.

## Planned Routes (initial skeleton)
- `/business`
- `/business/login`
- `/business/dashboard`
- `/business/bookings`
- `/business/billing`
- `/business/users`

## Security Notes
- Strong tenant/account segregation across business customers.
- RBAC for account owner vs account member scopes.
- Billing-impact actions require audit logging.
- No secrets/keys/tokens in source files.

## Migration Relationship with `current-site`
- No direct first-class page exists in `current-site`; this app is scaffolded per architecture Phase 3 planning.
- Any reused UX patterns must be adapted into API-governed, role-safe boundaries.
- `current-site/` is not modified.

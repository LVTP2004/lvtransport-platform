# API App (`apps/api`)

## Purpose
- Central authoritative backend service layer for LV Transport Platform domains.
- Provides authentication, booking, tracking, admin, driver, business, and future eats APIs.

## Boundaries
- In scope:
  - Domain contracts, validation, authorization, and persistence boundaries.
  - Role-aware endpoints and audit logging for privileged actions.
  - Public and protected API surface separation.
- Out of scope (initial skeleton stage):
  - Full implementation of all domain handlers.
  - Non-essential integrations before phase priorities.

## Planned Route Groups (initial skeleton)
- `/api/health`
- `/api/auth/*`
- `/api/bookings/*`
- `/api/tracking/*`
- `/api/driver/*`
- `/api/admin/*`
- `/api/business/*`
- `/api/eats/*`

## Security Notes
- Default-deny authorization for protected endpoints.
- Central RBAC enforcement across all domains.
- Secure session lifecycle and token handling policy (no client-side secret exposure patterns).
- Secrets must come from environment/managed secret stores, never repository files.

## Migration Relationship with `current-site`
- Replaces static/demo browser-local logic from `current-site` scripts with canonical server-side contracts.
- Will absorb incomplete legacy behaviors (for example admin config publish fallback) into authenticated persisted endpoints.
- Enables staged decommission of legacy ZIP/static hosting once parity and security gates are met.

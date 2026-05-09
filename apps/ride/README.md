# Ride App (`apps/ride`)

## Purpose
- Passenger experience for requesting rides, viewing ride status, tracking trip progress, and managing rider account entry points.
- Frontend owner of ride booking UX while `apps/api` remains the source of truth for business logic.

## Boundaries
- In scope:
  - Booking creation and booking status views.
  - Tracking UI and ride timeline presentation.
  - Rider-authenticated screens and profile-access links.
- Out of scope:
  - Dispatch decision engine and authoritative status mutation logic (API-owned).
  - Driver operational workflows and admin controls.

## Planned Routes (initial skeleton)
- `/ride`
- `/ride/book`
- `/ride/tracking/:trackingId`
- `/ride/history`
- `/account`

## Security Notes
- Do not persist auth/session tokens in `localStorage`; target secure server-managed session patterns.
- Enforce role checks via API responses and route guards.
- Treat tracking identifiers as sensitive operational data.
- No embedded credentials or environment secrets.

## Migration Relationship with `current-site`
- Primary migration source pages:
  - `current-site` `index.html` (booking entry)
  - `current-site` `tracking.html` (trip tracking)
  - `current-site` `account.html` (account flows)
- Replaces static/demo client logic with API-first contracts defined in `apps/api`.
- `current-site/` is reference-only and unchanged.

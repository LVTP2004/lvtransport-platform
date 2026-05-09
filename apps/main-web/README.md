# Main Web App (`apps/main-web`)

## Purpose
- Public-facing LV Transport website shell for marketing, service overview, and support entry points.
- Owns top-of-funnel discovery journeys and links users into transactional apps (Ride, Account, Support).

## Boundaries
- In scope:
  - Public content pages and informational UI.
  - Navigation to authenticated/transactional experiences owned by other apps.
  - Public-safe configuration rendering from API-managed endpoints.
- Out of scope:
  - Booking lifecycle state changes (owned by `apps/ride` + `apps/api`).
  - Driver/admin operational workflows.
  - Privileged account actions.

## Planned Routes (initial skeleton)
- `/`
- `/services`
- `/about`
- `/support`
- `/contact`

## Security Notes
- No hardcoded secrets, API keys, passwords, or tokens.
- Only consume public API endpoints from `apps/api`.
- Sanitize/encode all dynamic content before rendering.
- Enforce secure headers and CSP when implemented.

## Migration Relationship with `current-site`
- Primary migration source pages:
  - `current-site` `index.html` (public homepage)
  - `current-site` `support.html` (support content)
- This app replaces static page-local behavior with API-backed, deployable platform routes.
- `current-site/` remains immutable source material and is not modified.

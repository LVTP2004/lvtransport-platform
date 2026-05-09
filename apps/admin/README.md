# Admin App (`apps/admin`)

## Purpose
- Internal operations console for LV administrators to monitor bookings, intervene in workflows, and manage operational configuration.

## Boundaries
- In scope:
  - Admin dashboards and operational controls.
  - Privileged workflow actions with audit requirements.
  - Site/operations configuration interfaces backed by authenticated API endpoints.
- Out of scope:
  - Public marketing pages.
  - Driver task execution UI.
  - Direct database-side logic in frontend.

## Planned Routes (initial skeleton)
- `/admin`
- `/admin/login`
- `/admin/bookings`
- `/admin/drivers`
- `/admin/config`
- `/admin/audit-log`

## Security Notes
- Strict RBAC enforcement for admin and super-admin roles.
- No prefilled operational identities in public assets.
- All privileged actions must produce audit trail events via `apps/api`.
- No credentials or tokens stored in repository files.

## Migration Relationship with `current-site`
- Primary migration source page:
  - `current-site` `admin.html`
- Replaces partial local-preview behavior with authenticated, persisted API-backed admin operations.
- `current-site/` remains untouched and serves only as migration input.

# Driver App (`apps/driver`)

## Purpose
- Driver operational application for availability state, assignment handling, and trip execution flows.

## Boundaries
- In scope:
  - Driver authentication entry and session-aware UI.
  - Online/offline availability controls.
  - Assignment acceptance/rejection and trip progress updates.
- Out of scope:
  - Passenger booking initiation UX.
  - Admin-wide operational controls.
  - Authoritative dispatch orchestration logic (API-owned).

## Planned Routes (initial skeleton)
- `/driver`
- `/driver/login`
- `/driver/dashboard`
- `/driver/assignments`
- `/driver/trip/:tripId`
- `/driver/profile`

## Security Notes
- Role isolation between driver and admin surfaces.
- No localStorage token strategy in final implementation; use secure session handling.
- Protect location and assignment data as sensitive operational information.
- No hardcoded secrets or credentials.

## Migration Relationship with `current-site`
- Primary migration source page:
  - `current-site` `driver.html`
- Removes risk-prone static artifacts and migrates flows to API-backed state transitions.
- Temporary files in legacy package (for example `driver.html.0.tmp`) are not carried forward.

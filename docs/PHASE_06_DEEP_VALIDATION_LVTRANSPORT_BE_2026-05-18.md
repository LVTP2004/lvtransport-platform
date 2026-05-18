# LVTRANSPORT.BE — Deep Validation Before Consolidation (Phase 06)

Date: 2026-05-18 (UTC)
Scope: `lvtransport.be` only (web booking/tracking + admin surface + API support paths).

## Files inspected

- `apps/web/src/app/App.tsx`
- `apps/web/src/pages/Admin.tsx`
- `apps/admin/src/app/App.tsx`
- `apps/api/src/modules/bookings/service.ts`
- `apps/api/src/modules/bookings/repository.ts`
- `apps/api/src/routes/v1/tracking.routes.ts`
- `apps/api/src/routes/v1/booking.routes.ts`

## Findings

### 1) Booking code

- **Real API usage present**: web booking submits via `fetch(${API_BASE_URL}/bookings)` and fails closed when API base is missing.
- **Reference generation is mixed**:
  - Frontend generates provisional client code (`LVxxxxx`) using random math.
  - API generates canonical reference code (`LV-<stamp>-<token>`). Frontend uses API `referenceCode` when available.
- **Persistence behavior is real on API side**:
  - Bookings are persisted in `.data/bookings.json` through `FileBookingRepository` (create/update/list + idempotency/fingerprint index).
- **Error handling exists**:
  - Missing API endpoint, non-OK HTTP, and network exceptions have explicit user feedback.
- **No fake localStorage for booking persistence**:
  - Booking persistence is not stored in localStorage.
  - However, `sessionStorage` is used for client dedupe gate and `localStorage` is used for identity gating only.

### 2) Tracking code

- **Real reference lookup exists**:
  - Web checks `/tracking/booking/:code`.
  - API normalizes code to uppercase and resolves against persisted booking `referenceCode`.
- **Real API usage present** on frontend and backend route wiring.
- **Coherent status display mostly present**:
  - Lifecycle normalization and immutable/active signal are shown in UI.
- **Critical contract mismatch found**:
  - Web expects response payload at `payload.data`.
  - API returns booking under `payload.booking`.
  - Result: real bookings can be treated as incomplete tracking data by the web UI.
- **Not-found/error states** are explicit and user-readable (missing code / missing API / 404 / network).

### 3) Admin code

- **Real bookings displayed**:
  - `apps/admin` fetches `/admin/bookings` and renders lifecycle cards from API data.
- **Metrics are derived from real API data** in `apps/admin`:
  - Active/pending rides and incident-derived runtime state are computed from fetched bookings/drivers/incidents.
- **Legacy admin page (`apps/web/src/pages/Admin.tsx`)** also fetches real endpoints for metrics/bookings.
- **No fake counters in the primary admin app** (`apps/admin`) for bookings-driven panels; counters are derived from API responses.
- **Lifecycle visibility improved**:
  - Ride list includes status, lifecycle version, pickup, destination, and priority attention cards.

### 4) Architecture

- **No evidence of mandatory realtime complexity in lvtransport.be customer flow**:
  - Booking/tracking uses HTTP endpoints; no hard dependency on websocket in the customer page.
- **No direct AI/sound/experimental contamination on critical booking/tracking runtime paths**:
  - Moni/Leo messaging exists in UI/ops narratives, but booking/tracking execution paths remain API-based.
- **Dependency shape appears acceptable for this phase**:
  - No new unnecessary infrastructure assumptions identified in inspected paths.

### 5) Runtime safety

Validation actions performed were read-only code inspection and static command checks.

- No deploy executed.
- No PM2 restart executed.
- No VPS configuration change executed.
- No secrets edited.

## Risk level

**Medium**

Reason: the tracking API/UI response-shape mismatch is operationally material and can cause false “incomplete tracking data” outcomes for valid references.

## Remaining concerns

1. Tracking contract mismatch (`payload.data` vs `payload.booking`) must be fixed before consolidation.
2. Dual reference semantics (frontend provisional code vs backend canonical code) can confuse operators if API response is delayed or intercepted.
3. Two admin implementations (`apps/admin` and `apps/web/src/pages/Admin.tsx`) increase drift risk; consolidation target should be explicit.

## Recommendation

**Fix first (do not consolidate yet).**

Consolidate only after tracking contract alignment is corrected and validated against real booking references end-to-end.

## Validation commands used

```bash
pwd
rg --files
rg -n "booking|tracking|admin|reference|localStorage|metrics|counter|api" apps/web packages -S
rg -n "bookings|tracking|admin/bookings|referenceCode|localStorage|sessionStorage" apps/api/src apps/admin/src apps/web/src -S
sed -n '1,460p' apps/web/src/app/App.tsx
sed -n '1,260p' apps/web/src/pages/Admin.tsx
sed -n '1,240p' apps/api/src/modules/bookings/service.ts
sed -n '1,220p' apps/api/src/modules/bookings/repository.ts
sed -n '1,220p' apps/api/src/routes/v1/tracking.routes.ts
sed -n '1,220p' apps/admin/src/app/App.tsx
```

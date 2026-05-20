# MODULES — LV Transport Platform (Operational Ecosystem)

## 1) LV Ride (`apps/ride`, `apps/web`)

### Purpose
Premium customer-facing ride booking and trip lifecycle experience.

### Scope
- Realtime booking creation and lifecycle states
- Airport transfers, business rides, long-distance requests
- Estimated pricing hooks (API-driven)
- Booking history/account-readiness structure
- Multilingual-ready customer flow

### Key Dependencies
- LV API orchestration
- Realtime lifecycle stream
- Pricing engine
- Payments + notifications

---

## 2) LV Business (`apps/business` + API business domain)

### Purpose
Corporate and executive mobility account operations.

### Scope
- Company account structures
- Recurring rides and fixed-route readiness
- VIP priority business flow
- Invoice/reporting and subscription-readiness modeling
- Profitability/account analytics readiness

### Key Dependencies
- LV API bookings/pricing/auth
- Admin governance and interventions

---

## 3) LV VIP / LV Black (cross-module service class)

### Purpose
Ultra-premium executive service layer across Ride, Driver, and Admin.

### Scope
- Premium ride category strategy
- Priority dispatch abstraction
- Executive airport pickup and discreet transport flow
- Premium notification/styling contract compatibility
- Concierge-ready extension points

### Key Dependencies
- Booking + dispatch orchestration
- Pricing engine VIP modifiers
- Notification templates

---

## 4) LV Driver (`apps/driver`)

### Purpose
Driver operational companion interface.

### Scope
- Online/offline mode
- Acceptance and assignment flow
- Realtime ride-state updates
- Activity and earnings/statistics readiness
- ETA/GPS/navigation integration readiness
- Reputation/scoring-ready event model

### Key Dependencies
- LV API driver + booking services
- Realtime driver status channels
- Maps/tracking package hooks

---

## 5) LV Admin Control Tower (`apps/admin`)

### Purpose
Central realtime mobility operations center.

### Scope
- Live booking and driver monitoring
- Operational event timeline visibility
- Dispatch intervention and override tooling readiness
- Pricing override controls
- Incident/risk/fraud monitoring foundation
- Advanced clients management foundation

### Key Dependencies
- LV API orchestration and audit events
- Realtime booking/driver/admin streams

---

## 6) LV API (`apps/api`)

### Purpose
Central backend control plane for all mobility operations.

### Scope
- Booking orchestration and lifecycle policy enforcement
- Driver assignment and status propagation
- Auth/session handling
- Payment integration boundaries
- Notification engine boundaries
- Pricing engine centralization
- GPS/tracking-ready endpoints and service layers

### Key Dependencies
- Realtime transport
- Data persistence
- Auth providers
- Payments/maps/notifications integrations

---

## 7) LV Eats Foundation (`apps/eats` + future API module)

### Purpose
Future multi-service expansion using shared mobility primitives.

### Scope (initial)
- Module scaffolding and domain boundaries
- Order/courier lifecycle alignment with booking/driver patterns
- Reuse of realtime, auth, pricing, notifications and admin patterns

---

## 8) Main Web (`apps/main-web`)

### Purpose
Brand and acquisition layer for LV Transport premium positioning.

### Scope
- Premium brand presentation
- Service discovery and conversion funnel
- Optional integration points into Ride/Business booking entry

---

## Priority Evolution Track

1. Stabilize canonical lifecycle + realtime consistency
2. Harden control tower and driver orchestration metrics
3. Expand business/VIP operational tooling
4. Add dispatch automation and predictive analytics
5. Reuse platform primitives for LV Eats rollout

# MODULES — LV Transport Platform

## 1) LV Ride (`apps/ride`)

### Purpose
Taxi and premium passenger transport flows.

### Scope
- Ride request creation
- Pickup/dropoff handling
- Fare estimate/summary integration hooks
- Trip status lifecycle (requested, assigned, in-progress, completed, cancelled)

### Key Dependencies
- LV API (domain logic)
- LV Driver (fulfillment)
- LV Admin (operations overrides and support)

---

## 2) LV Driver (`apps/driver`)

### Purpose
Operational panel for drivers and delivery couriers.

### Scope
- Driver/courier profile and readiness state
- Availability toggling
- Assignment acceptance/rejection
- Active job status management
- Earnings/summary visibility (phase-dependent)

### Key Dependencies
- LV API
- LV Ride (ride assignments)
- LV Eats (future delivery assignments)
- LV Admin (manual interventions)

---

## 3) LV Admin (`apps/admin`)

### Purpose
Control tower for operational oversight.

### Scope
- Live operations dashboard
- Booking/assignment oversight
- Support and incident workflows
- Role-managed operational tools
- Audit and intervention tracking

### Key Dependencies
- LV API
- LV Ride / LV Driver / LV Business / LV Eats domain events

---

## 4) LV Business (`apps/business`)

### Purpose
VIP and corporate client management experience.

### Scope
- Company account management
- Team/member role handling
- Subscription plans
- Invoice visibility and account billing lifecycle

### Key Dependencies
- LV API
- LV Admin (support + account governance)

---

## 5) LV Eats (`apps/eats`)

### Purpose
Food ordering and local delivery workflows (prepared for later phases).

### Scope (initial)
- Module structure readiness
- Merchant/order/courier data model preparation
- Delivery lifecycle alignment with driver/admin platform capabilities

### Key Dependencies
- LV API
- LV Driver
- LV Admin

---

## 6) LV API (`apps/api`)

### Purpose
Central backend and single source of business truth.

### Scope
- Authentication and authorization services
- Booking/driver/business/eats domain endpoints
- Event, state, and audit persistence
- Integration layer (email, payments, maps, invoicing)

### Key Dependencies
- Data stores
- Infrastructure/deployment services
- All application modules as clients

---

## 7) Main Web (`apps/main-web`)

### Purpose
Public-facing LV Transport website.

### Scope
- Brand presence
- Service discovery
- Marketing and contact funnel

### Key Dependencies
- Optional API integrations for lead/contact flows

---

## Development Priority Reminder

- **Phase 1:** LV Ride + LV Admin + LV Driver + LV API
- **Phase 2:** login, roles, bookings, tracking, emails
- **Phase 3:** LV Business/VIP
- **Phase 4:** LV Eats basic structure
- **Phase 5:** marketplace expansion

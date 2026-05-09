# ARCHITECTURE — LV Transport Platform

## 1) Architectural Style

LV Transport Platform follows a **modular, API-first, multi-application architecture**:

- Multiple frontend apps by domain (Ride, Driver, Admin, Business, Eats, Main Web)
- Single central backend (`apps/api`) as authoritative domain service layer
- Shared platform services for identity, notifications, tracking, and auditing

## 2) High-Level Components

1. **Experience Layer**
   - `apps/main-web`
   - `apps/ride`
   - `apps/driver`
   - `apps/admin`
   - `apps/business`
   - `apps/eats`

2. **Application/API Layer**
   - `apps/api` (core domain APIs)
   - Domain modules exposed via service boundaries

3. **Data & Integration Layer**
   - Operational database(s)
   - Event and audit logs
   - External integrations (email, payments, maps, invoicing)

4. **Operations Layer**
   - Deployment (`deploy/`)
   - Monitoring, observability, and incident response processes

## 3) Domain Boundaries (Initial)

- **Identity Domain**: authentication, sessions, password flows, multi-role support.
- **Booking Domain**: ride requests, state transitions, dispatch lifecycle.
- **Driver Domain**: onboarding state, availability, assignment response.
- **Tracking Domain**: location/events timeline and trip progress states.
- **Business Domain**: corporate accounts, subscription plans, billing references.
- **Delivery Domain (Eats readiness)**: merchant/order/courier entities scaffolded for future.
- **Admin Domain**: dashboard views, interventions, operational controls.

## 4) Data Ownership Principles

- LV API owns authoritative write paths for core business entities.
- Frontends do not contain duplicated business decision logic.
- Cross-domain read models may be composed, but ownership remains explicit.
- Audit history for sensitive actions is mandatory.

## 5) API Principles

- Versioned endpoints and change-control discipline.
- Strict authn/authz enforcement on all non-public endpoints.
- Idempotency where retries are likely (booking updates, status transitions).
- Validation and schema consistency across apps.
- Structured error model for operational troubleshooting.

## 6) Environments

Minimum environment strategy:

- **Development**
- **Staging**
- **Production**

Requirements:

- Isolated data per environment
- Distinct credentials and secrets per environment
- Controlled rollout and rollback procedures

## 7) Phase-Based Implementation Focus

- **Phase 1:** LV Ride + LV Admin + LV Driver + LV API
- **Phase 2:** login, roles, bookings, tracking, emails
- **Phase 3:** LV Business/VIP
- **Phase 4:** LV Eats basic structure
- **Phase 5:** marketplace expansion

## 8) Architectural Guardrails

- No reuse of external branded UI/assets/text from competitors.
- Keep modules loosely coupled through API contracts.
- Prefer composable services over monolithic feature entanglement.
- Preserve operational transparency for admin and support teams.

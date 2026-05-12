# ARCHITECTURE — LV Transport Platform (Premium Mobility SaaS Evolution)

## 1) Architectural Style

LV Transport Platform evolves as a **modular realtime mobility operations platform** while preserving the existing premium black/gold web experience, booking/auth/admin/driver flows, and VPS/PM2/Nginx compatibility.

Core style:
- Multi-app frontend by role/service (Ride, Driver, Admin, Business, future Eats)
- Central API orchestration layer (`apps/api`) as single source of operational truth
- Realtime event propagation for booking + driver + admin synchronization
- Domain modules that can scale independently toward SaaS-grade operations

## 2) Operational Hierarchy Alignment (Preparation Layer)

This repository now explicitly documents the conceptual LVTP hierarchy without changing existing runtime flows:

- **CEO / Founder:** Leonardo Daniel Vargas Hinojosa
- **Leo IA (Orchestration + Supervision Layer)**
  - Executive Intelligence Layer
  - LV Control Tower
  - Technical Infrastructure
  - AI Operations Layer
  - Customer Layer
  - Driver Layer
  - Future Ecosystem

Boundary rules:
- **Leo IA** orchestrates and supervises cross-layer alignment.
- **LV Control Tower** remains operational authority.
- **Booking Engine** remains operational source of truth.
- **Moni Assistant** remains inside AI Operations Layer.

## 3) Platform Domains

1. **LV Ride**
   - Customer booking lifecycle, pricing estimate, airport/business/long-distance requests.
2. **LV Business**
   - Corporate/VIP account grouping, recurring routes, invoice-ready monthly reporting.
3. **LV VIP / LV Black**
   - Priority dispatch and premium service class abstraction.
4. **LV Driver**
   - Driver operational lifecycle, acceptance flow, activity/earnings/statistics readiness.
5. **LV Admin Control Tower**
   - Live operations monitoring, interventions, pricing overrides, incident visibility.
6. **LV API**
   - Booking orchestration, auth/session, pricing engine, notifications, payment integration.
7. **LV Eats foundation**
   - Future multi-service extensibility by reusing dispatch, driver, realtime, and billing patterns.

## 4) Canonical Booking Lifecycle (Operations)

Canonical lifecycle for operational sync:

`pending -> accepted -> assigned -> onderweg -> arrived -> in_progress -> completed`

Terminal branch:

`cancelled`

Architecture note:
- Backward-compatible transitional states like `quoted`, `confirmed`, and `available` remain supported in realtime orchestration to avoid breaking existing deployments while migrating to the canonical premium lifecycle.

## 5) Realtime Operational Model

Realtime architecture responsibilities:
- **Booking stream:** create/update/lifecycle changes emitted as ordered events
- **Driver stream:** online/offline + assignment status propagation
- **Admin stream:** control tower updates and intervention visibility
- **Idempotency:** event retries protected by idempotency keys
- **Version checks:** expected-version protection on critical status transitions
- **Reconnect safety:** websocket clients receive snapshot hydration on reconnect before incremental events

## 6) Centralized Orchestration Layers

### Booking orchestration
- API-owned status transitions with transition policy enforcement.
- Single authoritative booking timeline for audits and interventions.

### Driver orchestration
- Driver state map for availability, assignment, and trip-stage progression.
- Future heat-zone/ETA/navigation hooks via maps package boundaries.

### Pricing orchestration
- Central API-driven pricing engine (day/night, airport, minimum fare, long-distance, waiting-time, VIP/business modifiers, dynamic pricing-ready extension points).

### Payment + notification lifecycle
- Payment events and notification templates remain modularized; wiring remains API-driven and environment-configurable.

## 7) Admin Control Tower Architecture

Admin is positioned as a realtime operations center:
- Live booking queue and status timeline visibility
- Live driver state visibility
- Manual assignment/intervention hooks
- Pricing override entry points
- Incident and operational event logging foundation
- Readiness for live map/GPS and dispatch automation augmentation

## 8) AI Operations Layer (Moni Preparation)

Non-destructive preparation contracts are now defined for:
- Moni Assistant core context
- Multilingual AI responses
- Booking context reading boundaries
- Escalation queue structures
- AI audit log structures
- Operational prompt template structures

These contracts are extension points only and do not change current booking/realtime behavior.

## 9) Multi-Service Expansion (LV Eats + Ecosystem Readiness)

LV Eats and broader ecosystem foundation leverage shared patterns:
- Booking lifecycle pattern -> order lifecycle analogue
- Driver lifecycle pattern -> courier lifecycle analogue
- Control tower pattern -> delivery operations analogue
- Pricing + notification + auth + realtime modules reused with domain-specific adapters
- Leo IA orchestration boundary reused across future service verticals

## 10) Operational Automation Foundation

Infrastructure-ready architecture supports:
- PM2 health and restart workflows
- Uptime/error monitoring hooks
- Booking/incident alerts
- Centralized logging and backup routines
- Scheduled operational reporting

## 11) Guardrails

- No full redesign; preserve current premium branding and responsive UX
- No breaking of existing auth, booking, admin, driver, realtime, payment, deployment flows
- No hardcoded secrets; environment-driven config
- Keep modules composable and bounded for production scaling

# ROADMAP — LV Transport Platform

## Overview

This roadmap defines progressive delivery from core ride operations to multi-module marketplace expansion.

## Phase 1 — Core Operations Foundation

**Priority modules:** LV Ride + LV Admin + LV Driver + LV API

Primary outcomes:

- Ride request and fulfillment core flow defined.
- Driver availability and assignment workflows defined.
- Admin operational control and visibility foundation defined.
- API service boundaries and baseline contracts defined.

Exit criteria:

- Core module interfaces and responsibilities documented.
- Security baseline mapped to Phase 1 objectives.
- Deployment and environment structure ready for implementation start.

### Immediate Next Step (Execution Kickoff)

To move from planning to delivery, start with a thin end-to-end slice that validates core platform plumbing:

1. Define a minimal booking lifecycle (`requested -> assigned -> in_progress -> completed`).
2. Expose a first API contract for booking creation and status updates.
3. Wire driver availability + assignment as a mocked service behind a stable interface.
4. Add baseline operational observability (request logging + health endpoint + error envelope).

Suggested deliverables for this kickoff:

- API contract draft (OpenAPI or equivalent) for booking + assignment.
- Module boundary note for `LV API`, `LV Driver`, and `LV Admin`.
- One demo flow runnable in local dev showing booking state transitions.

## Phase 2 — Platform Account & Transaction Core

**Priority capabilities:** login, roles, bookings, tracking, emails

Primary outcomes:

- Unified authentication and role model.
- Booking lifecycle state model.
- Tracking event timeline model.
- Notification baseline via email flows.

Exit criteria:

- Account/permission model approved.
- Booking-tracking data model finalized.
- Email events matrix defined for core workflows.

## Phase 3 — LV Business / VIP

Primary outcomes:

- Corporate/VIP account model.
- Subscription and invoicing workflow design.
- Business dashboard functional scope.

Exit criteria:

- Business module contracts and admin interactions documented.
- Financial and account lifecycle requirements approved.

## Phase 4 — LV Eats (Basic Structure)

Primary outcomes:

- Structural module foundation for food/local delivery.
- Merchant/order/courier core entities documented.
- Interface points with existing driver and admin systems defined.

Exit criteria:

- Eats base architecture integrated into platform blueprint.
- Security and role adaptations documented.

## Phase 5 — Marketplace Expansion

Primary outcomes:

- Multi-vertical scaling strategy.
- Shared capability reuse across modules.
- Performance and operational scaling roadmap.

Exit criteria:

- Cross-module governance model formalized.
- Expansion prioritization framework approved.

## Conceptual Branch — LV Tech Operations (Future)

**Status:** Conceptual roadmap only (non-production).

Purpose:

- Establish a future AI-powered operational technology and business solutions branch for SMBs in Belgium.

Scope preparation:

- premium websites, booking systems, operational dashboards
- AI assistants, realtime coordination/tracking, automation workflows
- VPS deployment preparation, PM2/Nginx operational readiness
- reusable SaaS modules and multilingual support

Guardrails:

- No interference with LV Ride active operations.
- No production API behavior changes.
- No live billing implementation in conceptual stage.

Reference architecture document:

- `docs/LV-TECH-OPERATIONS-CONCEPTUAL-BRANCH.md`
## Future Concept Branch (2026-05-12)

- See `docs/FUTURE-CONCEPT-LVTP-ECOSYSTEM-ROADMAP.md` for long-term ecosystem planning.
- See `docs/FUTURE-CONCEPT-LVTP-ECOSYSTEM-DIAGRAMS.md` for conceptual architecture diagrams.

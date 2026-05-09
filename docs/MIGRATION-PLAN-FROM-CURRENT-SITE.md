# Migration Plan from Current Site to LV Transport Platform

Date: 2026-05-09 (UTC)

## 1) Purpose

This document defines the migration plan from the audited static current site package (`current-site/lvtransport-platform-current-site.zip`) into the platform repository, aligned with the strategic direction in `docs/PROJECT-MASTERPLAN.md`.

Scope is documentation and migration planning only. No direct code implementation is included in this plan.

## 2) Inputs and Constraints

### Inputs
- Current site audit findings: page inventory, assets, risks, and partial/broken behavior.
- Platform masterplan priorities: Phase 1 and Phase 2 capabilities are the official near-term delivery focus.

### Constraints
- Keep LV brand continuity while moving to modular platform architecture.
- Prioritize operationally critical modules first: LV Ride, LV Admin, LV Driver, and LV API.
- Ensure migration decisions reinforce security-by-default and reliability principles.
- Treat `current-site/` as a source artifact for reference and extraction only; do not modify it.

## 3) Target Outcome

A production-ready platform baseline where:
- Public booking, tracking, account, driver, and admin experiences are migrated to canonical platform apps.
- API contracts replace browser-local demo behaviors.
- Authentication/session handling and release processes are hardened.
- Legacy static ZIP hosting can be decommissioned safely after phased validation.

## 4) Current-State Summary (from audit)

### Migrated surfaces
- Public pages: index, tracking, support, account.
- Operations pages: driver and admin.
- Shared assets: CSS, JS modules, brand images/icons, PWA manifest, service worker.

### Key risks to address during migration
1. localStorage token usage for multiple roles (XSS blast-radius risk).
2. Prefilled admin identity in public HTML.
3. Temporary artifact (`driver.html.0.tmp`) included in package.
4. Service worker cache/version drift risk.
5. Third-party runtime dependency (Leaflet via CDN) without local resilience.
6. Publicly exposed operational metadata in static config.

### Known partial behavior
- Admin “publish via API” flow is incomplete and falls back to local browser preview when endpoint is unavailable.

## 5) Migration Strategy (Masterplan-Aligned)

The migration is sequenced to match official development priority and platform principles.

### Stage A — Discovery, Mapping, and Acceptance Baseline

Objective: establish exact parity targets and migration boundaries before implementation.

Deliverables:
- Page-to-module mapping:
  - `index.html` -> LV Ride / Main public website
  - `tracking.html` -> LV Ride + LV API tracking events/timeline
  - `driver.html` -> LV Driver
  - `admin.html` -> LV Admin
  - `account.html` -> LV Ride account/auth profile flows
  - `support.html` -> Main public website support surface
- Asset catalog with keep/replace decisions (brand-safe and performance-aware).
- UX parity checklist for critical journeys (booking, tracking, driver workflow, admin oversight, account auth).

Exit criteria:
- Stakeholder-approved parity checklist and route/module mapping.

### Stage B — Phase 1 Foundation Cutover (LV Ride, LV Admin, LV Driver, LV API)

Objective: migrate operational core to platform architecture.

Deliverables:
- Canonical app shells/routes for Ride, Admin, Driver, and public site.
- API-centered flow definition replacing page-local business logic.
- Role-aware auth boundary definitions across passenger/driver/admin domains.

Exit criteria:
- Critical Phase 1 user journeys function in platform structure with mapped ownership.

### Stage C — Phase 2 Capabilities (Auth, Roles, Bookings, Tracking, Emails)

Objective: complete core capability set required by masterplan Phase 2.

Deliverables:
- Session strategy migration away from localStorage tokens toward secure server-managed session patterns (httpOnly cookie model where applicable).
- Booking lifecycle and tracking contracts finalized in LV API.
- Admin and support notifications workflow defined (email-first, extensible).
- Role and permission matrix documented and enforced at API boundaries.

Exit criteria:
- End-to-end booking and tracking flows validated with role-correct access controls.

### Stage D — Security and Configuration Hardening

Objective: remove known audit risks and establish secure operational defaults.

Deliverables:
- Remove prefilled admin identity from frontend artifacts.
- Eliminate temp/backup artifacts from packaging and release gates.
- Split public-safe config from sensitive server-managed config.
- Introduce audit logging for privileged config publication actions.

Exit criteria:
- Identified audit risks have documented mitigations and validation evidence.

### Stage E — Frontend and Dependency Modernization

Objective: improve maintainability and deployment consistency.

Deliverables:
- Consolidate static pages into platform frontend architecture.
- Bundle/pin external dependencies (e.g., Leaflet) through managed build pipeline.
- Single source of truth for app/version/cache keys.

Exit criteria:
- Deterministic builds and predictable asset/version behavior across environments.

### Stage F — Service Worker and Release Reliability

Objective: prevent stale-client regressions and improve rollback safety.

Deliverables:
- Version-aligned service worker cache strategy.
- Activation/update playbook for safe client refresh behavior.
- Smoke checks ensuring newly deployed clients resolve fresh assets.

Exit criteria:
- Deployment and rollback runbook validated in staging-like conditions.

### Stage G — QA, Launch, and Legacy Decommission

Objective: cut over safely and retire legacy hosting.

Deliverables:
- Functional QA across passenger, driver, admin, and support flows.
- Security validation (auth/session, role access, XSS-focused checks).
- Progressive cutover plan with monitoring and incident thresholds.
- Legacy ZIP/static hosting retirement checklist.

Exit criteria:
- Stable production metrics and formal go-live signoff.

## 6) Workstream Breakdown

### 6.1 Product & UX Workstream
- Define must-match vs intentionally-improved UX areas.
- Preserve LV identity while standardizing cross-module interaction patterns.

### 6.2 API & Domain Workstream
- Establish canonical contracts for bookings, tracking, account, and site config.
- Convert local preview behavior into authenticated persisted configuration APIs.

### 6.3 Security & Compliance Workstream
- Session hardening, least privilege access, and admin action auditability.
- Threat-focused reviews for public/admin/driver surfaces.

### 6.4 Platform & DevOps Workstream
- Environment separation, deployment automation, observability baselines.
- Release controls for artifact hygiene and cache/version coherence.

### 6.5 QA & Readiness Workstream
- Automated and manual validation matrix by role and journey.
- Launch readiness scoring and rollback rehearsals.

## 7) Milestones and Gates

1. **M1 — Audit-to-Plan Signoff**
   - Mapping, parity checklist, and migration backlog approved.
2. **M2 — Phase 1 Operational Core Available**
   - Ride/Admin/Driver/API baseline journeys functional.
3. **M3 — Phase 2 Capability Completion**
   - Auth/roles/bookings/tracking/emails integrated.
4. **M4 — Security & Reliability Gate**
   - Audit risks mitigated; release/cache strategy validated.
5. **M5 — Production Cutover**
   - Gradual traffic migration complete with monitoring.
6. **M6 — Legacy Decommission**
   - Static ZIP hosting retired after stabilization window.

## 8) Risks and Mitigations

- **Risk:** Hidden dependency on legacy page-local scripts.
  - **Mitigation:** explicit script-to-capability mapping and parity tests.

- **Risk:** Auth migration introduces regressions.
  - **Mitigation:** staged rollout and role-based regression suites before full cutover.

- **Risk:** Stale clients after deploy due to cache misalignment.
  - **Mitigation:** unified versioning and service worker update policy with smoke validation.

- **Risk:** Incomplete site-config publishing behavior persists.
  - **Mitigation:** enforce API-backed config publication and remove local-only fallback in production path.

## 9) Definition of Done for Migration

Migration is complete when all conditions are met:
- Core journeys run on platform modules (not legacy static pages).
- API contracts are authoritative for operational data and configuration.
- Security findings from the audit are remediated and verified.
- Release process reliably serves fresh assets across clients.
- Legacy current-site hosting is formally decommissioned.

## 10) Out of Scope for this Plan

- Implementing Phase 3+ features (LV Business/VIP, LV Eats expansion, broader marketplace scope).
- Introducing non-priority modules before Phase 1/2 objectives are complete.
- Reusing external branded code/assets outside LV identity policy.

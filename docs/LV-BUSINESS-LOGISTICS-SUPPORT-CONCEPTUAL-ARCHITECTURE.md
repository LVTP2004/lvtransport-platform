# LV Business Logistics Support (BLS) — Conceptual Architecture

## 1) Scope and intent

This document defines a **conceptual operational expansion** for LV Transport Platform: **LV Business Logistics Support (BLS)**, focused on emergency and backup logistics support for businesses in Belgium.

This architecture is intentionally non-production and preparation-oriented.

### In-scope (concept only)
- Emergency dispatch workflow
- Backup driver assignment
- Vehicle availability tracking
- Temporary route management
- Realtime operations monitoring
- Business account management
- Incident response lifecycle
- Operator availability states
- Fleet support workflows
- Admin control tower integration
- ETA/realtime coordination preparation
- Future SLA/service-level preparation

### Out-of-scope
- Production logistics execution engines
- Real contractual/legal SLA enforcement
- Real fleet ownership/telematics integration
- Production credentials, secrets, or partner keys
- Modifications to existing LV Ride operational flows

---

## 2) Expansion goals and business targets

### Goals
- Provide backup drivers/operators
- Provide temporary transport/logistics support
- Support operational disruptions
- Support delivery overflow
- Support vehicle failure replacement
- Support temporary route coverage
- Support business continuity operations

### Potential target segments
- Supermarkets
- Retail chains
- Logistics companies
- Hospitality businesses
- Mobility operators
- Event operations

---

## 3) Conceptual module architecture

The BLS domain is modeled as modular capabilities that can be introduced incrementally without disrupting existing LV Ride services.

### 3.1 Module map
1. **Business Account Module**
   - Business profile, locations, contact matrix
   - Operational criticality profile
   - Preferred support windows and regions (Belgium coverage)

2. **Incident Intake & Triage Module**
   - Incident registration (overflow, vehicle failure, staffing gap, route gap)
   - Severity scoring and priority classification
   - Dispatch policy selection (manual-assisted, semi-automated, future automated)

3. **Emergency Dispatch Orchestrator**
   - Converts triaged incidents into support missions
   - Applies assignment constraints (time window, region, operator category)
   - Coordinates mission lifecycle and escalation

4. **Backup Operator Management Module**
   - Backup driver/operator pool registry
   - Certification/tier metadata (conceptual)
   - Availability state service and assignment readiness

5. **Support Fleet Availability Module**
   - Conceptual support vehicle pool (internal/partner placeholders)
   - Vehicle readiness states
   - Replacement candidate shortlist for failure scenarios

6. **Temporary Route Management Module**
   - Temporary route definitions for disruption intervals
   - Coverage gap modeling
   - Route handover and closure workflow

7. **Realtime Coordination & ETA Module (Preparation)**
   - Mission telemetry aggregation interface
   - ETA estimation contract boundaries
   - Event stream model for control tower updates

8. **Operations Monitoring Module**
   - Mission and incident operational dashboards
   - SLA risk indicators (conceptual)
   - Alerting and escalation state views

9. **Incident Response Lifecycle Module**
   - Unified incident state model
   - Post-incident review payloads
   - Continuity recovery checkpoints

10. **Admin Control Tower Integration Module**
    - Read models for admin UX
    - Intervention hooks (reassign/escalate/override)
    - Global regional load map abstraction

11. **SLA/Service-Level Preparation Module**
    - Service-tier templates (bronze/silver/gold, conceptual)
    - Response target modeling
    - Reporting contract for future legal/commercial SLA implementation

---

## 4) Core lifecycle models (conceptual)

### 4.1 Incident lifecycle
`REPORTED -> TRIAGED -> DISPATCH_PENDING -> ASSIGNING -> IN_PROGRESS -> STABILIZING -> RESOLVED -> REVIEWED -> CLOSED`

Key transitions:
- `TRIAGED -> DISPATCH_PENDING`: incident validated for support activation
- `ASSIGNING -> IN_PROGRESS`: operator and/or vehicle confirmed
- `IN_PROGRESS -> STABILIZING`: acute disruption contained
- `RESOLVED -> REVIEWED`: post-incident operational assessment created

### 4.2 Support mission lifecycle
`CREATED -> CANDIDATE_MATCHING -> CONFIRMED -> EN_ROUTE -> ACTIVE_SUPPORT -> HANDOVER -> COMPLETED | CANCELLED`

### 4.3 Operator availability lifecycle
`OFF_DUTY -> ON_STANDBY -> DISPATCH_CANDIDATE -> RESERVED -> ENGAGED -> COOLDOWN -> ON_STANDBY`

### 4.4 Vehicle support lifecycle
`UNVERIFIED -> READY -> RESERVED -> DEPLOYED -> RETURNING -> MAINT_CHECK -> READY`

### 4.5 Temporary route lifecycle
`DRAFT -> ACTIVE_TEMPORARY -> MONITORED -> HANDOVERD -> ARCHIVED`

(*Note:* `HANDOVERD` intentionally retained as a stable event token; future implementation may alias to `HANDOVERED`.)

---

## 5) DTO/interface preparation (non-production contracts)

These DTOs define conceptual boundaries only and are intended for future API/event design.

### 5.1 `BusinessSupportRequestDTO`
- `requestId: string`
- `businessAccountId: string`
- `requestType: 'DISRUPTION' | 'OVERFLOW' | 'VEHICLE_FAILURE' | 'ROUTE_GAP' | 'STAFFING_GAP'`
- `severity: 'P1' | 'P2' | 'P3'`
- `affectedRegionCode: string` *(BE region/district abstraction)*
- `requestedWindowStart: string` *(ISO datetime)*
- `requestedWindowEnd: string` *(ISO datetime)*
- `estimatedLoadUnits?: number`
- `notes?: string`

### 5.2 `IncidentTriageDTO`
- `incidentId: string`
- `triageScore: number`
- `classification: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'`
- `dispatchMode: 'CONTROLLED_MANUAL' | 'SEMI_AUTOMATED' | 'AUTO_READY'`
- `recommendedSupportType: 'OPERATOR_ONLY' | 'VEHICLE_ONLY' | 'COMBINED'`

### 5.3 `BackupOperatorProfileDTO`
- `operatorId: string`
- `operatorType: 'DRIVER' | 'LOGISTICS_OPERATOR' | 'MIXED'`
- `coverageRegions: string[]`
- `availabilityState: 'OFF_DUTY' | 'ON_STANDBY' | 'DISPATCH_CANDIDATE' | 'RESERVED' | 'ENGAGED' | 'COOLDOWN'`
- `capabilityTags: string[]`
- `maxShiftSupportHours?: number`

### 5.4 `SupportVehicleAvailabilityDTO`
- `vehicleSupportId: string`
- `vehicleCategory: 'VAN' | 'TRUCK_LIGHT' | 'TRUCK_MEDIUM' | 'SPECIAL'`
- `availabilityState: 'UNVERIFIED' | 'READY' | 'RESERVED' | 'DEPLOYED' | 'RETURNING' | 'MAINT_CHECK'`
- `regionCode: string`
- `estimatedReadyAt?: string`

### 5.5 `TemporaryRouteCoverageDTO`
- `tempRouteId: string`
- `originNode: string`
- `destinationNode: string`
- `activeFrom: string`
- `activeUntil: string`
- `coverageReason: 'DISRUPTION' | 'OVERFLOW' | 'TEMP_EXPANSION'`
- `supportMissionId?: string`

### 5.6 `RealtimeMissionStatusDTO`
- `missionId: string`
- `incidentId: string`
- `missionState: string`
- `operatorState?: string`
- `vehicleState?: string`
- `lastTelemetryAt?: string`
- `etaToStabilizationMinutes?: number`
- `riskFlag?: 'NONE' | 'LATENCY' | 'RESOURCE_SHORTAGE' | 'ESCALATION_REQUIRED'`

### 5.7 `SLAReadinessSnapshotDTO`
- `snapshotId: string`
- `serviceTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'CUSTOM'`
- `targetResponseMinutes?: number`
- `actualDispatchLatencyMinutes?: number`
- `withinTarget?: boolean`
- `notes?: string`

---

## 6) Operational workflows (conceptual)

### 6.1 Emergency dispatch workflow
1. Business account submits support request.
2. Incident Intake creates incident record and triage payload.
3. Triage scoring assigns severity and dispatch mode.
4. Dispatch Orchestrator creates support mission.
5. Operator and/or vehicle candidate matching starts.
6. Control Tower receives live mission state.
7. Mission transitions to active support.
8. Stabilization, handover, closure, and incident review.

### 6.2 Backup driver assignment workflow
1. Filter standby operators by region, operator type, capability tags.
2. Rank candidates by readiness and proximity abstraction.
3. Reserve top candidate (with fallback chain).
4. Confirm assignment and lock temporary mission linkage.
5. Promote mission to active once operator check-in is confirmed.
6. If no candidate available, escalate to control tower for manual fallback.

### 6.3 Vehicle failure replacement workflow
1. Failure incident classified as `VEHICLE_FAILURE`.
2. Pull ready replacement list in target region.
3. Reserve best-fit replacement candidate.
4. Assign temporary route continuity support.
5. Monitor ETA to operational restoration.

### 6.4 Delivery overflow support workflow
1. Overflow signal exceeds configured threshold.
2. Create overflow incident with load estimate.
3. Dispatch combined operator + vehicle support when needed.
4. Partition temporary route coverage windows.
5. Close once backlog returns below threshold.

---

## 7) Realtime coordination architecture (preparation)

### 7.1 Event domains
- `incident.events`
- `mission.events`
- `operator.events`
- `vehicle-support.events`
- `route-temp.events`
- `sla-readiness.events`

### 7.2 Conceptual event flow
1. Domain module emits normalized state events.
2. Realtime coordination layer enriches with correlation keys (`incidentId`, `missionId`, `businessAccountId`).
3. Monitoring read models update control tower projections.
4. ETA preparation component consumes mission/operator/route signals.
5. SLA readiness reporter generates aggregate snapshots.

### 7.3 Control tower read model projections
- Active incidents by severity and region
- Pending assignment queue and aging buckets
- Operator standby density heatmap (conceptual)
- Vehicle readiness capacity by category
- Mission risk and escalation board

---

## 8) Modular SaaS integration strategy (concept)

BLS is designed as a modular domain extension that can evolve into SaaS-style offerings for business customers.

### 8.1 Integration principles
- Domain isolation from current LV Ride operational flows
- Event-driven interoperability over direct tight coupling
- Contract-first DTOs before implementation
- Tiered capability activation per business account

### 8.2 Suggested bounded contexts
- `bls-business-accounts`
- `bls-incident-response`
- `bls-dispatch-orchestration`
- `bls-operator-readiness`
- `bls-fleet-support`
- `bls-temp-routes`
- `bls-realtime-control-tower`
- `bls-sla-readiness`

### 8.3 Tenant and service packaging (future)
- Core package: incident intake + dispatch + monitoring
- Expansion package: temporary routes + overflow support
- Premium package: advanced realtime coordination + SLA analytics

---

## 9) Expansion roadmap (conceptual phases)

### Phase 0 — Concept stabilization
- Validate lifecycle definitions and module boundaries
- Align business account taxonomy and support request classes
- Define first canonical event names and DTO versions

### Phase 1 — Internal prototype architecture
- Build non-production orchestration prototype
- Simulate operator and vehicle state transitions
- Validate control tower projection model shape

### Phase 2 — Pilot readiness architecture
- Add tenant-aware business account controls
- Enable SLA readiness snapshots and baseline reporting
- Establish incident postmortem and continuity templates

### Phase 3 — Controlled external pilot
- Onboard limited business pilot cohort in Belgium
- Operate manual-assisted dispatch mode with strict oversight
- Measure dispatch latency, recovery time, and overflow containment

### Phase 4 — Service-level maturation
- Introduce policy-driven semi-automated assignments
- Refine ETA/realtime reliability models
- Prepare legal/commercial SLA conversion track

---

## 10) Non-goals and governance guardrails

- No production dispatch automation in this phase.
- No legal SLA enforcement in this phase.
- No direct mutation of LV Ride production workflows.
- No production integrations requiring credentials/secrets.
- All outputs are architecture artifacts for planning and controlled prototyping only.


# Moni AI Operations Manager Architecture (MVP Preparation)

## 1) Authority and Governance Model

- **Final authority**: Leonardo Daniel Vargas Hinojosa (CEO/Founder) remains final decision authority for strategic, legal, financial, contractual, and critical operational decisions.
- **Moni Assistant role**: central AI operations management layer for LVTP, coordinating specialized branch agents.
- **Human-in-the-loop requirement**: no critical execution without explicit human approval.
- **Hard controls**:
  - No automatic send of official emails.
  - No automatic final invoice issuance.
  - No autonomous legal/financial commitments.
  - No exposure of internal backend/infrastructure details in public outputs.

## 2) High-Level Multi-Agent Architecture

1. **Moni Assistant Orchestrator**
   - Accepts tasks, performs intent/risk classification, assigns branch agent, tracks lifecycle.
2. **Agent Registry**
   - Controlled registry of branch agents with version, capabilities, and scope.
3. **Policy & Permission Engine**
   - Role-based authorization + approval routing by action and risk domain.
4. **Shared Context Layer**
   - Redacted operational context references across bookings, drivers, tracking, finance, and incidents.
5. **Decision Support Layer**
   - Generates recommendation options with explicit assumptions, risks, and missing data.
6. **Approval & Escalation Layer**
   - Mandatory founder escalation for critical/sensitive domains.
7. **Audit & Action History Layer**
   - Immutable action and state transition logs for all AI recommendations/actions.

## 3) Specialized Branch Agents

- Moni Ride
- Moni Business
- Moni Logistics
- Moni Interim
- Moni Lift
- Moni Rail
- Moni Eats (future)
- Moni Admin
- Moni Finance
- Moni Support

Each branch agent is **advisory-first** and constrained to defined action scopes.

## 4) Task and Decision Lifecycle

1. `created`
2. `queued`
3. `in_progress`
4. `waiting_for_ai`
5. `blocked_missing_context` (if data gaps)
6. `waiting_for_human_approval` (if approval required)
7. `ready_for_execution`
8. `executed`
9. `failed` / `cancelled`
10. `archived`

Critical actions always pass through `waiting_for_human_approval`.

## 5) Approval and Escalation Workflows

### Approval flow
- AI drafts action artifact (document/email/invoice recommendation).
- Policy engine flags required approval domain.
- Human admin review occurs.
- If high/critical legal, financial, contractual, strategic, or external communication impact: route to founder confirmation.

### Escalation flow
- Trigger conditions:
  - critical risk,
  - legal/financial boundary crossing,
  - conflicting operational data,
  - missing mandatory approval,
  - safety incident.
- Escalation target for critical path: Leonardo Daniel Vargas Hinojosa.

## 6) Permission Boundaries (MVP)

- **Moni Assistant**: orchestration, routing, recommendation synthesis, audit emission.
- **Branch agents**: scoped recommendations only within branch capabilities.
- **Human admins**: approve/reject/edit recommendations.
- **Founder**: final approval for sensitive domains.

## 7) Document/Email/Invoice Drafting Controls

- **Document drafting**: draft-only until approved.
- **Official email drafting**: draft-only; no direct send path in MVP.
- **Invoice preparation**: draft estimates and summaries only; finance/founder approval required before finalization.

## 8) Shared Memory and Context

- Use context references (not raw unrestricted data dumps).
- Include source system, confidence, language, redaction level, and sync timestamp.
- Enforce minimum context completeness before actionable recommendations.

## 9) Multilingual Operations

Required support in architecture contracts:
- Dutch (`nl`)
- Spanish (`es`)
- English (`en`)
- French (`fr`)

## 10) Future Integrations (Prepared, Not Activated)

Prepared interfaces for:
- bookings
- payments
- drivers
- business accounts
- logistics systems
- tracking systems
- admin dashboards

No production keys, no live financial execution, and no automatic external dispatch in MVP.

## 11) Implementation Artifacts in Codebase

MVP interface contracts are implemented in:
- `packages/moni-assistent/src/operationsManager.ts`
- exported via `packages/moni-assistent/src/index.ts`

These interfaces define:
- agent registry models,
- permission rules,
- task lifecycle states,
- approval/escalation/audit models,
- operational DTOs for document/email/invoice drafting,
- multilingual and integration readiness contracts.

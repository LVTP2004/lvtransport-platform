# LVTransport Role Control Plane and MONI Architecture

Status: architecture proposal only. This document does not enable permissions, payments, production actions, model autonomy, or deployment.

## Objective

LVTransport should expose different operational surfaces according to identity, role, capability and risk. Each surface may have its own MONI assistant, while MONI Core remains the shared coordination layer.

The intended product hierarchy is:

```text
LVTRANSPORT.BE
|
+-- Public / Customer
|   +-- User surface
|   |   +-- User MONI
|   +-- Business surface
|       +-- Business MONI
|       +-- Future-driver / partner onboarding
|
+-- Driver operations
|   +-- Driver LV
|       +-- Driver MONI
|
+-- Operations
|   +-- Dispatch LV
|   |   +-- Dispatch MONI
|   +-- Admin LV
|   |   +-- Admin MONI
|   +-- Expert LV
|   |   +-- Expert MONI
|   +-- LV Control Tower
|       +-- Control Tower MONI
|
+-- Company authority
    +-- Founder OS
        +-- Founder MONI
        +-- MONI Core
        +-- Treasury / Finance authority
            +-- Finance MONI
```

This is not simply a UI hierarchy. Every layer must have a distinct authorization contract.

## Role surfaces

### User

Customer-facing ride and transport experience. User MONI may assist with product navigation, bookings, trip information and support within the permissions of the authenticated customer.

It must not inherit Driver, Dispatch, Admin, Expert, Control Tower, Founder or Treasury capabilities.

### Business

The Business layer is for people or organizations interested in participating in the LV ecosystem. This includes future drivers, transport partners and other onboarding candidates.

Business MONI may explain requirements, collect permitted onboarding information, guide application flows and report application state. Being in Business does not automatically grant Driver privileges.

A successful onboarding process must explicitly transition an identity from candidate/business state into an authorized operational role.

### Driver LV

Driver-facing operational surface. Driver MONI is scoped to the driver's own work: assigned jobs, permitted navigation/operational context, driver support and driver-specific workflow.

A Driver identity must not become Dispatch or Admin merely because the same person can reach those routes in the frontend.

### Dispatch LV

Dispatch is an operational coordination layer. Dispatch MONI may coordinate work that has been explicitly authorized for dispatchers, but must not inherit Founder or Treasury authority.

### Admin LV

Administrative product and operational controls. Admin MONI should operate against an explicit capability policy rather than treating the string `admin` as universal authority.

### Expert LV

Expert is a specialized technical/advanced role. Expert MONI can expose diagnostic or engineering capabilities that ordinary Admin or Driver roles do not need.

Expert is not equivalent to Founder and must not automatically receive financial authority.

### LV Control Tower

Control Tower is the cross-system operational view. Control Tower MONI should aggregate health, incidents, fleet/dispatch state, infrastructure signals and approved operational actions.

Control Tower can coordinate but must not silently become the final authority for company ownership or money movement.

### Founder OS

Founder OS is the highest company-governance surface in the product architecture. It represents owner-level decision authority, policy, approval and supervision.

Founder MONI is the assistant for this surface. MONI Core can coordinate requests and evidence, but the current repository guardrails remain fail-closed: an AI response, model output, GitHub login, repository permission or ordinary review is not by itself proof of founder authorization.

Founder OS must remain compatible with the separate Founder OS authority work already being developed in this repository.

### Treasury / Finance authority

A dedicated authority layer is required for high-risk financial operations such as payments, banking integrations, payouts, refunds, treasury actions and other movement of company funds.

This layer sits under company ownership/governance but has a separate permission boundary.

Finance MONI may prepare, explain, reconcile or propose a financial action. Kimi K2 may reason about the request. Devstral may maintain integration code. MONI Core may orchestrate the workflow. None of those components should independently become the authority that moves money.

A real financial action should require an explicit policy-controlled authorization path with strong identity verification, audit evidence, amount/scope constraints, idempotency and provider-side confirmation. The exact banking/payment implementation is not defined by this document.

## MONI Core

MONI Core is not one model and should not be identified with Kimi K2 or Devstral.

MONI Core is the shared coordination/control plane responsible for concepts such as:

- agent identity and role context;
- capability resolution;
- routing between MONI surfaces and model/tool backends;
- policy evaluation;
- approval boundaries;
- task and evidence exchange;
- audit correlation;
- memory/knowledge routing where authorized;
- fail-closed handling when identity, policy or evidence is missing.

The assistants are role-specific views over this control plane:

```text
User MONI
Business MONI
Driver MONI
Dispatch MONI
Admin MONI
Expert MONI
Control Tower MONI
Founder MONI
Finance MONI
       |
       v
    MONI CORE
```

They do not need to be separate foundation models. They can be separate agents with different identity, context, tools, policies and permissions.

## Model responsibilities

### Kimi K2

Kimi K2 is considered a reasoning/planning engine for MONI, not an authority boundary.

Potential responsibilities include understanding complex requests, planning multi-step work, synthesizing operational context and selecting an appropriate workflow. Model availability, licensing, deployment mode and actual integration must be evaluated separately before production use.

### Devstral

Devstral is considered an engineering/execution-oriented model for software work, especially repository analysis, implementation proposals, tests and local engineering workflows.

Devstral must remain constrained by repository policy, review gates and the allowed execution nodes. Producing code is not equivalent to permission to merge, deploy, alter production, or execute a financial action.

### Combined pattern

A target flow can be:

```text
Human / service request
        |
role-specific MONI
        |
     MONI Core
        |
 policy + identity + capability
        |
   +----+------------------+
   |                       |
Kimi K2                 Devstral
reason/plan             engineer/test
   |                       |
   +-----------+-----------+
               |
        evidence/proposal
               |
     required human/system gate
               |
       authorized action
```

Models may propose. Authorization belongs to the appropriate control layer.

## B-Box 3V+ architecture study

The local read-only study of the B-Box 3V+ exposed a useful architectural pattern that can inform LVTransport without copying the router implementation.

Observed GUI concepts include:

- distinct `User`, `Admin` and `Expert` identities in the login surface;
- frontend visibility based on the current user;
- a separate runtime capability check such as `isAdmin()`;
- capability-specific paths for MPTCP and Business Continuity;
- resources and controls represented by explicit XMO paths;
- privileged VLAN configuration visible only to an appropriate role;
- feature visibility controlled separately from the mere existence of a page.

Examples observed during the read-only study include MPTCP status/configuration, a second PPP session, `IP_DATA_MPTCP`, VLAN 4081, WAN backup and Business Continuity.

The important lesson for LVTransport is the separation:

```text
IDENTITY -> ROLE -> CAPABILITY -> RESOURCE -> OPERATION
```

LVTransport should extend this pattern with explicit approval and risk boundaries:

```text
IDENTITY
  -> ROLE
  -> CAPABILITY
  -> RESOURCE
  -> OPERATION
  -> RISK POLICY
  -> APPROVAL AUTHORITY
  -> AUDIT EVIDENCE
```

The B-Box study is architectural research only. Router credentials, provider-only functions or hidden privileged access are not prerequisites for adopting this design principle.

## Capability model

Role names alone are insufficient. Authorization should eventually be expressed as capabilities, for example:

```text
ride.request
ride.view.own
driver.job.view.assigned
driver.job.accept
dispatch.job.assign
admin.user.support
expert.system.inspect
controltower.incident.coordinate
founder.policy.approve
finance.payment.prepare
finance.payment.approve
finance.payment.execute
```

These names are illustrative and are not an implemented authorization schema.

Sensitive capabilities should be separable. In particular, `prepare`, `approve` and `execute` for financial actions should not collapse into one permission.

## Security invariants

1. Frontend visibility is not authorization.
2. A role string is not sufficient proof of capability.
3. MONI Core coordinates; it does not manufacture authority.
4. Kimi K2 and Devstral are engines, not privileged identities.
5. Each MONI receives only the tools and context needed for its role.
6. Business onboarding does not automatically become Driver authorization.
7. Expert does not automatically become Founder.
8. Founder does not implicitly bypass a separately defined Treasury policy.
9. Financial execution requires a dedicated, auditable authority path.
10. Missing identity, capability, policy, approval or evidence must fail closed.
11. High-risk actions must be idempotent and auditable.
12. Model output must never be treated as proof that a real-world action occurred.

## Relationship to existing LVTransport work

This proposal complements rather than replaces:

- `ARCHITECTURE.md` operational guardrails;
- `AGENTS.md` agent contract;
- Founder OS architecture and decision-record work;
- Founder GitHub review authority work;
- MONI V10 and the existing GitHub/Devstral integration work.

It does not change the current production architecture, deployment process, API, database, authentication, payment provider, banking provider, or network.

## Proposed implementation sequence

1. Define a canonical role and capability registry.
2. Map every product surface to allowed capabilities.
3. Define MONI agent profiles with explicit tool/context boundaries.
4. Make MONI Core evaluate capability policy before tool dispatch.
5. Integrate reasoning/engineering engines behind MONI Core rather than granting them direct authority.
6. Finish Founder OS identity/approval foundations.
7. Design Treasury/Finance as a separate high-risk authority domain.
8. Add immutable/auditable decision and action receipts.
9. Add negative tests proving cross-role escalation fails.
10. Only then connect sensitive real-world execution providers.

## Current status

This document records the intended architecture. It does not claim that the role system, Kimi K2 integration, Treasury OS, banking execution, or all MONI variants already exist.

No production deployment, router change, payment, banking action, authentication change or privilege escalation is part of this proposal.

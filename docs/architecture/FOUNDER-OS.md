# Founder OS

Status: architecture concept
Last updated: 2026-11-12

## Role

Founder OS is the proposed desktop governance and decision surface for LVTP CORE. Its purpose is to compress system complexity into a clear view of current state, risk, priorities, pending decisions and authorized actions.

Founder OS does not replace MONI. The intended separation is:

- Founder OS: governance, priorities, risk, architecture and human decision surface.
- MONI: context, observation, coordination and workflow mediation.
- LVTP CORE: shared platform/control foundation.
- Nodes/runtimes: execution environments.
- Human operator: final authority for actions requiring human approval.

## Proposed Founder Dashboard

The desktop experience may show global LVTP CORE health; Aspire, Minisforum and Viviana Linux as distinct identities; active agents and tasks; risk/attention items; pending approvals; GitHub/PR/check status; MONI Bridge/MCP health; authorized deployment/service state; and decision/audit history.

## Relationship to MONI Edge

Founder OS is the desktop control/governance experience. MONI Edge is the mobile secure extension on FOSSiBOT.

They should share request IDs, identities, capability policies and audit records. A decision made from either surface should reconcile through LVTP CORE/MONI rather than creating two independent control planes.

## Design principle

PC, tablet and phone interfaces are authorized consoles. They are not independent authorities. The canonical operational state should remain in the control plane and its auditable sources.

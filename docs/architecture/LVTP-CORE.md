# LVTP CORE

Status: architecture record
Last updated: 2026-11-12

## Purpose

LVTP CORE is the shared platform/control foundation connecting MONI, execution nodes, development agents, repositories and authorized user interfaces.

## Current architecture direction

Key participants include:

- MONI / MONI V10 coordination layer.
- MONI Bridge / MCP integration layer.
- GitHub as durable code/change history.
- Codex and Devstral as development/agent participants.
- Aspire, Minisforum and Viviana Linux as separate execution identities.
- NATS for live event transport; durable messaging is a future requirement for critical workflows.
- Tailscale for private node connectivity where configured.
- Founder OS as proposed desktop governance surface.
- MONI Edge as proposed mobile secure control surface.

## Source-of-truth principles

- GitHub records code, documentation, commits and PR history.
- Runtime state must come from authenticated, recent evidence from the relevant node; do not infer it from another node.
- Documentation must label planned capabilities separately from verified implementation.
- Approval/audit state should become durable and queryable rather than existing only in transient UI or chat messages.

## Control principle

LVTP CORE should prefer explicit capabilities and policies over broad machine access. Human approval should be scoped, attributable and auditable.

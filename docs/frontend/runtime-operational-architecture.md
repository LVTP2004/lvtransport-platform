# Runtime Operational Architecture

## Purpose

Define how LVTransport runtime, agents, lineage, observability, deployment, and Founder OS operate together.

This is the operational blueprint of the platform.

## Core runtime principle

apps/api-runtime is the operational source of truth.

legacy apps/api is not part of production runtime.

## Runtime layers

### Layer 1 — API Runtime

Responsible for:

- health endpoints
- bookings
- notifications
- tracking
- runtime contracts
- operational state

### Layer 2 — Persistence Foundation

Responsible for:

- memory store
- future sqlite durability
- safe fallback behavior
- state isolation

### Layer 3 — Event Store

Responsible for:

- append-only events
- operational lineage
- replay source
- audit history

### Layer 4 — Agent Layer

Responsible for:

- health checks
- validation
- recovery
- diagnostics
- readiness
- supervisor cycles

### Layer 5 — Observability Layer

Responsible for:

- logs
- metrics
- uptime
- dashboards
- degradation detection

### Layer 6 — Founder Intelligence

Responsible for:

- operational confidence
- revenue pulse
- runtime status
- incident intelligence
- replay summaries

## Agent topology

Agents are divided into:

- observer agents
- validator agents
- recovery agents
- orchestrator agents
- supervisor agents

Agents must never mutate legacy apps/api.

## Runtime recovery pipeline

1. Detect failure
2. Confirm degradation
3. Create backup
4. Execute minimal recovery
5. Validate health
6. Write lineage event
7. Report to Founder OS

## Deployment pipeline

1. Build
2. Validate
3. Health check
4. Replay check
5. Promote
6. Deploy
7. Validate
8. Record lineage

## Event pipeline

Runtime event flow:

runtime action
→ event append
→ lineage store
→ replay system
→ Founder OS
→ admin visibility

## Observability pipeline

Runtime emits:

- health state
- logs
- metrics
- restart count
- incident state
- recovery state

Observability consumes and exposes:

- Grafana
- Loki
- Promtail
- Uptime Kuma
- PM2
- runtime health endpoints

## Replay pipeline

Replay consumes:

- booking events
- driver events
- incident events
- recovery events
- payment events
- runtime events

Replay outputs:

- timeline replay
- spatial replay
- operational replay
- founder replay

## Runtime memory

Runtime memory includes:

- current operational state
- event lineage
- recovery logs
- deployment history
- agent reports
- health snapshots

## Production rules

Production runtime must be:

- minimal
- observable
- recoverable
- contract-driven
- lineage-aware
- rollback-capable

## Forbidden architecture

The platform must not return to:

- monolith repair
- legacy apps/api dependency
- untracked mutations
- hidden runtime state
- undocumented recovery
- agent actions without lineage

## Governance rules

- apps/api-runtime is authoritative.
- agents protect runtime first.
- observability is mandatory.
- lineage is mandatory.
- replay is append-only.
- Founder OS is read-only intelligence.
- unknown runtime state blocks automation.

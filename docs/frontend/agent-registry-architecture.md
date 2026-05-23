# Agent Registry Architecture

## Purpose

Define how LVTransport discovers, classifies, coordinates, validates, and supervises operational agents.

The agent registry is the nervous system of the autonomous operational layer.

## Core principle

Agents must be known, classified, permissioned, observable, and auditable.

No unknown agent may mutate runtime.

## Registry responsibilities

The registry must track:

- agent name
- agent type
- capability
- permission level
- target scope
- last run
- last result
- health state
- lineage output
- failure reason

## Agent types

### Observer Agent

Reads state only.

Capabilities:

- health check
- log inspection
- git status
- PM2 status
- runtime introspection

Mutation permission:

- none

### Validator Agent

Validates runtime correctness.

Capabilities:

- syntax validation
- endpoint validation
- contract validation
- smoke testing
- readiness checks

Mutation permission:

- none

### Recovery Agent

Repairs runtime state.

Capabilities:

- restart PM2
- restore backup
- rollback runtime
- rerun health checks
- write recovery lineage

Mutation permission:

- controlled runtime mutation

### Lineage Agent

Records operational history.

Capabilities:

- append events
- write audit entries
- correlate events
- prepare replay records

Mutation permission:

- append-only lineage mutation

### Orchestrator Agent

Coordinates other agents.

Capabilities:

- select agent
- run agent
- collect result
- stop unsafe loops
- report state

Mutation permission:

- orchestration only

### Supervisor Agent

Runs scheduled governance cycles.

Capabilities:

- periodic health validation
- readiness checks
- agent registry inspection
- drift detection
- summary reports

Mutation permission:

- controlled orchestration

## Agent permissions

### Read-only

Can inspect but not mutate.

### Append-only

Can write logs or lineage only.

### Controlled mutation

Can restart, restore, or rollback approved runtime targets.

### Human-gated

Requires human approval.

Used for:

- database schema changes
- payment logic
- auth logic
- credential changes
- destructive cleanup

## Safe targets

Agents may operate on:

- apps/api-runtime
- apps/api-lab
- runtime
- logs
- backups/runtime
- scripts/agents
- docs/frontend

## Forbidden targets

Agents must not mutate:

- legacy apps/api
- secrets
- .env files
- SSH keys
- payment credentials
- GitHub credentials
- production database files

## Agent health states

- unknown
- ready
- running
- succeeded
- failed
- degraded
- blocked
- human_required

## Registry event model

Every agent execution must emit:

- AGENT_STARTED
- AGENT_COMPLETED
- AGENT_FAILED
- AGENT_BLOCKED

Recovery agents may also emit:

- RECOVERY_STARTED
- RECOVERY_COMPLETED
- RECOVERY_FAILED
- ROLLBACK_EXECUTED

## Coordination rules

The orchestrator must:

- check registry before running agent
- verify permissions
- avoid duplicate concurrent runs
- stop repeated failure loops
- record every result
- report unsafe state

## Founder OS visibility

Founder OS must show:

- active agents
- last successful agent
- failed agents
- blocked agents
- recovery confidence
- registry health
- unsafe automation warnings

## Governance rules

- Unknown agents cannot mutate runtime.
- Agents must declare capabilities.
- Agents must write lineage.
- Repeated failures block automation.
- Human-gated actions require approval.
- Runtime safety overrides automation speed.

# Operational Agent Governance

## Purpose

Define how LVTransport operational agents are allowed to observe, repair, validate, rollback, and report runtime state.

Agents must improve stability without corrupting production.

## Agent mission

Agents exist to:

- detect runtime degradation
- validate health
- create safe backups
- execute controlled recovery
- preserve lineage
- report operational state
- support Founder OS intelligence

## Agent hierarchy

### Level 1 — Observer agents

Can read:

- runtime health
- PM2 state
- logs
- metrics
- event lineage
- git status

Cannot modify runtime.

### Level 2 — Validator agents

Can run:

- syntax checks
- health checks
- endpoint checks
- contract checks
- smoke tests

Cannot deploy changes without passing validation.

### Level 3 — Recovery agents

Can execute:

- PM2 restart
- runtime backup
- rollback
- runtime restore
- recovery scripts

Must write lineage entries.

### Level 4 — Orchestrator agents

Can coordinate:

- observers
- validators
- recovery agents
- reports
- Founder OS summaries

Must not directly mutate legacy apps/api.

## Safe zones

Agents may operate on:

- apps/api-runtime
- apps/api-lab
- scripts/agents
- logs
- backups/runtime
- docs/frontend

## Forbidden zones

Agents must not mutate:

- legacy apps/api
- secrets
- .env files
- SSH keys
- production database files
- payment credentials
- GitHub credentials

## Recovery rules

Before recovery:

- verify failure
- write reason
- create backup
- identify target
- run validation

During recovery:

- execute minimal safe action
- avoid repeated loops
- record output
- stop on unknown failure

After recovery:

- validate health
- write lineage event
- update logs
- report final state

## Rollback rules

Rollback is allowed only when:

- runtime is unhealthy
- latest deployment caused failure
- backup exists
- validation confirms rollback target

Rollback must preserve:

- timestamp
- previous version
- rollback reason
- validation result

## Automation boundaries

Agents must not:

- rewrite large runtime modules blindly
- delete production data
- disable observability
- suppress errors without reporting
- hide degraded states
- repeatedly restart in a loop

## Human approval required

Required for:

- database migrations
- payment logic changes
- auth/session changes
- destructive cleanup
- credential rotation
- production schema changes

## Lineage requirements

Every agent action must record:

- agent name
- action type
- target
- timestamp
- result
- failure reason if any

## Founder OS integration

Founder OS must see:

- active agents
- last agent action
- recovery confidence
- failed validations
- rollback history
- runtime protection state

## Governance rules

- Agents protect runtime first.
- Legacy apps/api remains forbidden.
- Every mutation requires validation.
- Every recovery requires lineage.
- Every rollback requires proof.
- Unknown state must stop automation.

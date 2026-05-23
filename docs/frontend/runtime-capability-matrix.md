# Runtime Capability Matrix

## Purpose

Define which systems, agents, and operational surfaces may read, validate, mutate, recover, rollback, deploy, or block LVTransport runtime.

This is the authority model of the platform.

## Core principle

No system receives implicit authority.

Every capability must be explicit, state-aware, auditable, and governed.

## Capability classes

### READ

Can inspect runtime state.

Examples:

- health
- logs
- metrics
- status
- lineage
- replay

### VALIDATE

Can run checks without mutation.

Examples:

- syntax checks
- contract checks
- endpoint checks
- readiness checks

### APPEND

Can write append-only records.

Examples:

- logs
- lineage events
- audit entries
- replay records

### MUTATE

Can change current runtime state.

Examples:

- restart process
- restore runtime
- update operational state

### ROLLBACK

Can revert runtime to a previous approved state.

### DEPLOY

Can promote new runtime changes.

### BLOCK

Can stop automation or deployment.

### APPROVE

Human or governance approval required.

## Actor capability matrix

| Actor | Read | Validate | Append | Mutate | Rollback | Deploy | Block | Approve |
|---|---|---|---|---|---|---|---|---|
| Customer UI | yes | no | no | limited booking actions | no | no | no | no |
| Driver Cockpit | yes | no | telemetry only | trip actions only | no | no | no | no |
| Admin Tower | yes | no | audit actions | operational actions | no | no | yes | limited |
| Founder OS | yes | no | no | no | no | no | yes | yes |
| Observer Agent | yes | no | logs only | no | no | no | no | no |
| Validator Agent | yes | yes | validation result | no | no | no | yes | no |
| Lineage Agent | yes | no | yes | no | no | no | no | no |
| Recovery Agent | yes | yes | yes | controlled | yes | no | yes | no |
| Orchestrator Agent | yes | yes | yes | coordinate only | coordinate only | coordinate only | yes | no |
| Supervisor Agent | yes | yes | yes | no | no | no | yes | no |
| Human Operator | yes | yes | yes | yes | yes | limited | yes | yes |

## Runtime state capability rules

### HEALTHY

Allowed:

- read
- validate
- append
- controlled operational mutation
- deployment validation

Blocked:

- rollback without cause

### DEGRADED

Allowed:

- read
- validate
- append
- recovery preparation
- admin intervention

Blocked:

- risky deployment
- destructive mutation

### RECOVERING

Allowed:

- read
- append
- recovery mutation
- validation

Blocked:

- deployment
- unrelated mutation

### CRITICAL

Allowed:

- read
- append
- recovery
- rollback if backup exists

Blocked:

- deployment
- normal mutation
- non-essential automation

### OFFLINE

Allowed:

- observer diagnostics
- recovery restore
- rollback

Blocked:

- normal mutation
- deployment
- user-triggered mutation

### READONLY

Allowed:

- read
- append
- diagnostics

Blocked:

- booking mutation
- payment mutation
- destructive actions

### BLOCKED

Allowed:

- read
- diagnostics
- human review

Blocked:

- all mutation
- deployment
- rollback without approval

## Human-gated actions

Require human approval:

- database schema change
- payment logic change
- auth/session change
- credential rotation
- destructive cleanup
- legacy apps/api mutation
- production data deletion
- unknown runtime repair

## Deployment authority

Deployments require:

- validation success
- healthy or approved degraded state
- lineage entry
- rollback target
- post-deploy health check

Deployment is blocked by:

- CRITICAL
- OFFLINE
- BLOCKED
- RECOVERING
- failed validation
- missing rollback target

## Rollback authority

Rollback requires:

- runtime degradation proof
- known safe backup
- validation plan
- lineage entry
- post-rollback health check

## Founder OS authority

Founder OS may:

- read all operational intelligence
- display runtime state
- display confidence
- request human review
- block unsafe automation

Founder OS must not:

- mutate runtime directly
- rewrite lineage
- bypass governance

## Governance rules

- Unknown authority means denied.
- Unknown state means blocked.
- All mutation requires lineage.
- All rollback requires proof.
- All deployment requires validation.
- Human approval overrides automation only when recorded.

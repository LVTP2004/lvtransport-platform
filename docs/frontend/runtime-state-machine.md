# Runtime State Machine

## Purpose

Define the official operational state model for LVTransport runtime, agents, observability, recovery, replay, and Founder OS.

The runtime state machine is the operational nervous-state model of the platform.

## Core principle

Every system must classify runtime state consistently.

No frontend, agent, dashboard, or recovery process may invent runtime states.

## Runtime states

### HEALTHY

Runtime is operational.

Conditions:

- health endpoint responds
- PM2 process online
- contracts valid
- telemetry acceptable
- no critical incidents

Allowed actions:

- normal operations
- bookings
- dispatch
- telemetry
- deployment validation

### DEGRADED

Runtime is operational but impaired.

Conditions:

- partial telemetry failure
- delayed polling
- non-critical endpoint failure
- elevated latency
- warning-level incidents

Allowed actions:

- continue operations
- show degraded UI
- increase monitoring
- block risky deployments

### RECOVERING

Runtime is under controlled recovery.

Conditions:

- recovery agent active
- rollback in progress
- restart in progress
- validation running after failure

Allowed actions:

- preserve current state
- show recovery status
- block new risky mutations
- allow recovery agents only

### CRITICAL

Runtime is unstable or service-impacting.

Conditions:

- health checks failing
- PM2 restart loop
- critical endpoint failure
- multiple incidents active
- recovery failed

Allowed actions:

- trigger recovery
- freeze non-essential UI
- show critical Founder OS state
- block deployments

### OFFLINE

Runtime is unavailable.

Conditions:

- no health response
- PM2 stopped
- service unreachable

Allowed actions:

- show offline state
- preserve last known data
- trigger recovery if allowed
- block runtime mutations except restore

### BLOCKED

Automation must stop.

Conditions:

- unknown runtime state
- repeated recovery failure
- unsafe agent action detected
- missing backup
- validation incomplete

Allowed actions:

- human review
- diagnostics only
- observer agents only

### ROLLBACK

Runtime is reverting to a known safe state.

Conditions:

- rollback agent active
- previous runtime backup selected
- deployment failure detected

Allowed actions:

- rollback only
- validation only
- lineage append only

### READONLY

Runtime serves read-only operational data.

Conditions:

- write path unsafe
- database degraded
- payment unavailable
- mutation risk high

Allowed actions:

- health reads
- status reads
- Founder OS reads
- no booking mutation

## State transitions

HEALTHY may transition to:

- DEGRADED
- CRITICAL
- READONLY

DEGRADED may transition to:

- HEALTHY
- RECOVERING
- CRITICAL
- READONLY

RECOVERING may transition to:

- HEALTHY
- DEGRADED
- CRITICAL
- BLOCKED

CRITICAL may transition to:

- RECOVERING
- OFFLINE
- BLOCKED

OFFLINE may transition to:

- RECOVERING
- BLOCKED

ROLLBACK may transition to:

- HEALTHY
- DEGRADED
- BLOCKED

READONLY may transition to:

- HEALTHY
- DEGRADED
- CRITICAL

BLOCKED may transition only after human or approved diagnostic resolution.

## Forbidden transitions

- OFFLINE directly to HEALTHY without validation
- CRITICAL directly to HEALTHY without recovery lineage
- BLOCKED directly to deployment
- RECOVERING directly to deployment
- UNKNOWN state to mutation

## Agent behavior by state

### HEALTHY

All permitted agents may run within governance.

### DEGRADED

Observer, validator, and supervisor agents may run.

Recovery agents may prepare.

### RECOVERING

Only recovery, lineage, and supervisor agents may run.

### CRITICAL

Recovery agents may run if backup and validation rules are satisfied.

### OFFLINE

Only recovery and observer agents may run.

### BLOCKED

Only observer and diagnostics agents may run.

### READONLY

Mutation agents are blocked.

## Frontend behavior by state

### HEALTHY

Normal UI.

### DEGRADED

Show degraded indicators and last update timestamps.

### RECOVERING

Show recovery state and freeze unsafe actions.

### CRITICAL

Activate crisis mode.

### OFFLINE

Show offline state and last known data.

### BLOCKED

Show human review required.

### READONLY

Disable mutation actions.

## Founder OS visibility

Founder OS must show:

- current runtime state
- previous runtime state
- transition reason
- transition timestamp
- active agents
- recovery confidence
- blocking reason

## Replay semantics

Every state transition must be written to lineage.

Replay must reconstruct:

- state before
- state after
- trigger event
- actor or agent
- validation result

## Governance rules

- Runtime state is globally authoritative.
- Unknown state blocks mutation.
- Every transition requires lineage.
- Recovery requires validation.
- Rollback requires backup proof.
- Founder OS consumes state read-only.

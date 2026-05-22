# Operational Role Boundaries

## Purpose
This document formalizes deterministic operational governance boundaries in the LVTransport API. It defines who can execute which sensitive operations, what approvals are required, and which denial semantics are returned.

## Roles
The governance model introduces four operational roles:

- `founder`
- `operator`
- `auditor`
- `observer`

## Approval boundaries
Sensitive execution is classified into deterministic boundaries:

- `platform_configuration`
- `financial_disbursement`
- `customer_data_export`
- `production_execution`

Each boundary enforces:

- minimum required approvers
- approved approver role set
- deterministic allow/deny evaluation

## Execution permission model
Execution checks evaluate, in order:

1. role existence
2. execution privilege (`canExecute`)
3. role-boundary authorization
4. required approver quorum
5. human supervision requirement

Evaluation returns deterministic output containing:

- `allowed`
- `deterministicKey`
- `reasonCode` (for denial)
- `requiredApprovers`

## Deterministic denial semantics
Denials return one of:

- `UNKNOWN_ROLE`
- `INSUFFICIENT_EXECUTION_PERMISSION`
- `OUTSIDE_APPROVAL_BOUNDARY`
- `MISSING_REQUIRED_APPROVERS`
- `HUMAN_SUPERVISION_REQUIRED`

## Immutable role audit lineage
Operational role assignments are appended as immutable lineage entries containing:

- lineage id
- role
- assigning actor id
- assignment timestamp
- assignment reason
- immutable marker

This ensures governance traceability and auditability of operational authority transitions.

## Human-supervised execution guarantee
All defined operational roles require human supervision for approved execution paths. Requests lacking explicit human supervision are deterministically denied.

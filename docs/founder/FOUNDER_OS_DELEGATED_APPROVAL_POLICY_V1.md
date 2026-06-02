# FOUNDER OS DELEGATED APPROVAL POLICY V1

Status: CANONICAL  
Date: 2026-06-02T19:47:43+02:00  
Authority: Leonardo Vargas  
System: LVTP / Founder OS / MONI / LEONIDAS / ORACLE

## Core Decision

Leonardo is sovereignty.

Founder OS may approve operational actions without asking Leonardo only when those actions fall inside this delegated policy.

This policy exists because Leonardo is not physically inside the system and cannot continuously approve every low-risk operational step.

## Authority Rule

Leonardo delegates limited approval authority to Founder OS.

Founder OS may auto-approve LOW RISK actions.

Founder OS must request Leonardo approval for MEDIUM RISK actions.

Founder OS must block HIGH RISK actions until explicit Leonardo approval.

MONI does not approve.

LEONIDAS does not approve.

ORACLE does not approve.

Execution systems do not approve.

## Risk Classes

### LOW RISK — Auto Approval Allowed

Founder OS may auto-approve these actions:

- Read-only inspections
- Typecheck runs
- Build verification
- Report generation
- Context verification
- Target inspection
- Mismatch maps
- Queue refresh
- Founder state refresh
- Snapshots
- Safe-runs with rollback guard
- Small TypeScript repairs that do not alter canonical contracts
- Removing duplicate declarations
- Adding compatibility bridge methods
- Typing fixes that do not change runtime behavior
- Documentation updates
- Memory summaries
- Local commits that do not push to remote

Conditions:

- Must have journal
- Must have before/after typecheck
- Must rollback if errors increase
- Must not touch production runtime
- Must not modify secrets
- Must not delete large data
- Must not alter canonical governance without explicit approval

### MEDIUM RISK — Leonardo Approval Required

Founder OS must request approval for:

- Git push
- Changing public API behavior
- Modifying database schema
- Changing canonical contracts
- Touching payment logic
- Touching booking lifecycle behavior
- Modifying authentication or authorization
- Enabling new runtime automation
- Running scripts across multiple machines
- Sync between VPS and Aspire
- Any operation with uncertain blast radius

### HIGH RISK — Block Until Explicit Approval

Founder OS must block:

- Production deployment
- Production database mutation
- Secret rotation
- Deleting snapshots
- Deleting library documents
- Starting Dispatch Migration
- Starting Booking Migration
- Starting Tracking Migration
- Starting Driver Migration
- New architecture expansion
- Autonomous execution without rollback
- Any action that bypasses Founder OS
- Any action that cannot be journaled or reverted

## Delegated Workflow

MONI observes current reality.

LEONIDAS proposes the next progress step.

ORACLE evaluates future risk.

Founder OS classifies the risk.

If LOW RISK:

Founder OS may approve automatically.

If MEDIUM RISK:

Founder OS creates an approval request for Leonardo.

If HIGH RISK:

Founder OS blocks the action.

FORGE or any execution layer may execute only after Founder OS approval.

## Approval States

- AUTO_APPROVED
- APPROVAL_REQUIRED
- BLOCKED
- EXECUTED
- ROLLED_BACK
- COMPLETED

## Required Evidence Before Execution

Every action must include:

- Target
- Reason
- Risk class
- Expected outcome
- Rollback plan
- Typecheck before
- Typecheck after
- Journal path
- State refresh

## Current Binding Rule

Until API_BUILD_ZERO_ERRORS is reached, do not start:

- Dispatch Migration
- Booking Migration
- Tracking Migration
- Driver Migration
- Production expansion
- New architecture expansion

## Core Principle

Founder OS may act in Leonardo's name only inside written delegated limits.

Delegation is not autonomy.

Delegation is bounded governance.

MONI proposes.

LEONIDAS sequences.

ORACLE forecasts.

Founder OS validates and may approve only within policy.

Leonardo remains sovereign.

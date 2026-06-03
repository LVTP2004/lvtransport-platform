# MONI VERIFICATION RUNNER V1

Status: ACTIVE  
Date: 2026-06-03T03:15:20+02:00

## Purpose

MONI Verification Runner V1 verifies that the governance stack is structurally intact and measures the current API build state.

## Responsibilities

- Verify critical policy files
- Verify governance state files
- Verify dashboard files
- Run API typecheck
- Count TypeScript errors
- Identify current bottleneck
- Emit status
- Emit severity
- Emit decision

## Status Model

PASS → INFO  
WARN → DECISION_REQUIRED  
FAIL → HIGH_RISK  
CRITICAL → CRITICAL_FAILURE

## Current Output

/lvtp-data/moni/verification/current-verification.json

## Core Principle

No governance stack is complete unless it can verify itself.

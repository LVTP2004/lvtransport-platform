# EVENT SEVERITY MODEL V1

Status: ACTIVE

## Purpose

Classify all MONI ecosystem events by operational importance.

## Levels

- INFO
- ATTENTION
- DECISION_REQUIRED
- HIGH_RISK
- CRITICAL_FAILURE
- STRATEGIC_OPPORTUNITY

## Routing Rules

- INFO → Log only
- ATTENTION → Dashboard
- DECISION_REQUIRED → Founder approval
- HIGH_RISK → Founder OS review
- CRITICAL_FAILURE → Immediate alert
- STRATEGIC_OPPORTUNITY → ORACLE + LEONIDAS review

## Core Principle

Every event must have severity before governance action.

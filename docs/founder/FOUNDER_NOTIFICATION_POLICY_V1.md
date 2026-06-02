# FOUNDER NOTIFICATION POLICY V1

Status: ACTIVE  
Date: 2026-06-03T00:24:45+02:00

## Purpose

Define when Founder OS should interrupt Leonardo.

## Dependency

This policy depends on:

/lvtp-data/moni/policies/event-severity-policy.json

## Notification Rules

- INFO → no notification, log only
- ATTENTION → no notification, dashboard only
- DECISION_REQUIRED → notify Founder for approval
- HIGH_RISK → notify Founder for immediate review
- CRITICAL_FAILURE → urgent alert
- STRATEGIC_OPPORTUNITY → priority summary

## Core Rule

Founder is notified only when action, approval, risk, failure, or strategic opportunity requires human awareness.

## Governance Principle

MONI observes.

Event Severity classifies.

Founder Notification Policy routes.

Founder OS governs.

Leonardo decides.

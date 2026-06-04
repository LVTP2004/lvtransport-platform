# MONI APPROVAL AUTOMATION V1

Status: ACTIVE

## Purpose

Automates approval decisions after MONI Verification Runner V1.

## Policy

- INFO → AUTO_APPROVE
- LOW_RISK → AUTO_APPROVE
- DECISION_REQUIRED → FOUNDER_APPROVAL_REQUIRED
- MEDIUM_RISK → FOUNDER_APPROVAL_REQUIRED
- HIGH_RISK → BLOCK
- CRITICAL_FAILURE → BLOCK

## Safety

No GitHub commits.  
No production VPS changes.  
Payment architecture, database, auth, security, deployment and production changes are never auto-approved.

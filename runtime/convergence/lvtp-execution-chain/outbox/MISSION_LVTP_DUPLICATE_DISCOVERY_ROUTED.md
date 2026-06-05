# MISSION_LVTP_DUPLICATE_DISCOVERY_ROUTED

Generated: 2026-06-05T09:24:42Z

## Chain

Founder
↓
Founder OS
↓
Atlas
↓
Oracle
↓
Leonidas
↓
Nexus
↓
Auditor
↓
Forge

## Source Mission

runtime/convergence/atlas-code-delivery/inbox/MISSION_LVTP_DUPLICATE_DISCOVERY.md

## Atlas

Status: RECEIVED

Task:
Understand mission and collect evidence.

## Oracle

Status: ACTIVATED

Task:
Prioritize mission.

## Leonidas

Status: ACTIVATED

Task:
Coordinate next operational action.

## Nexus

Status: ACTIVATED

Task:
Generate proposal/specification/patch candidate only after root cause is confirmed.

## Auditor

Status: WAITING

Task:
Validate Nexus output.

## Forge

Status: BLOCKED

Reason:
Awaiting Auditor validation and Founder approval.

## Mission Content

```
# MISSION_LVTP_DUPLICATE_DISCOVERY_V1

Mission:
Identify duplicate, overlapping, legacy, backup, obsolete, or redundant components inside LVTP.

Objective:
Reduce duplication without breaking production.

Current Concern:
LVTP contains many repeated systems, backup files, old scripts, duplicate reports, duplicated runtime folders, overlapping MONI tools, and repeated governance/architecture artifacts.

Do not delete anything yet.

Workflow:
Founder defines mission.
Atlas collects evidence.
Oracle prioritizes duplicate risk.
Leonidas coordinates cleanup order.
Nexus proposes consolidation plan.
Auditor validates safety.
Forge executes only approved changes.

Atlas Responsibilities:
Scan repository and classify duplicates.

Classify into:

1. EXACT_DUPLICATE
Same content or same hash.

2. FUNCTIONAL_DUPLICATE
Different files doing same job.

3. LEGACY_BACKUP
.bak, backup, old recovery copies, archived operational files.

4. GOVERNANCE_DUPLICATE
Repeated laws, protocols, role maps, constitutions, authority documents.

5. MONI_DUPLICATE
Repeated MONI scripts, reports, modules, adapters, dashboards, repair tools.

6. RUNTIME_DUPLICATE
Repeated runtime/convergence folders, stale reports, old generated state.

7. SAFE_TO_ARCHIVE
Can be moved to archive after validation.

8. DO_NOT_TOUCH
Production-critical, canonical, active, or uncertain.

Required Evidence:
For every duplicate candidate, report:

- file path
- category
- reason
- canonical candidate
- risk level
- recommended action
- delete/move/merge/do-not-touch
- whether Founder approval is required

Canonical Priority:
Knowledge Gateway wins for truth.
Founder OS wins for governance.
Atlas wins for observation and registry.
Auditor wins for validation.
Production code wins over backup code.
Active runtime wins over stale runtime.
Latest verified report wins over old report.

Restrictions:
Do not delete files.
Do not move files.
Do not rewrite architecture.
Do not create new governance.
Do not replace Atlas.
Do not replace Knowledge Gateway.
Do not modify production.
Discovery only.

Expected Deliverables:
- LVTP_DUPLICATE_DISCOVERY_REPORT_V1.md
- LVTP_DUPLICATE_RISK_REGISTER_V1.json
- LVTP_CANONICAL_CANDIDATES_V1.md
- LVTP_ARCHIVE_PROPOSAL_V1.md

Success Criteria:
Atlas produces a ranked duplicate map.
No files are deleted.
No production behavior changes.
Founder can approve cleanup batch by batch.

Status:
DISCOVERY_IN_PROGRESS
```

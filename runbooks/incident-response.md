# LVTransport Incident Response Runbook

## Purpose
Provide consistent containment, recovery, and communication for operational incidents.

## Incident Severity Levels
- **SEV-1**: active outage, data corruption risk, or unsafe operational state.
- **SEV-2**: major degradation with workarounds.
- **SEV-3**: limited degradation or non-critical subsystem issue.
- **SEV-4**: minor issue, documentation/process gap.

## Containment Process
1. Acknowledge incident and assign incident lead.
2. Stop risky mutations if integrity or consistency is uncertain.
3. Preserve logs and current evidence snapshot.
4. Communicate current impact and temporary guardrails.

## Recovery Flow
1. Confirm system state (health, DB integrity, schema version).
2. Select least-destructive recovery path.
3. Run dry-run where applicable.
4. Execute approved recovery.
5. Re-validate health and integrity.
6. Reopen traffic gradually with operator supervision.

## Audit Preservation
- Preserve command history, log extracts, and key timestamps.
- Preserve who approved and who executed each recovery action.
- Retain incident channel summary and final timeline.

## Communication Expectations
- Initial incident notice with severity and scope.
- Periodic updates at agreed intervals.
- Explicit “contained”, “recovering”, and “resolved” markers.
- Post-resolution summary with user/business impact.

## Postmortem Expectations
Within agreed SLA (recommended 48 hours):
- Document root cause, triggers, and contributing factors.
- Document what worked/failed in response.
- Define concrete prevention actions with owners and dates.
- Update relevant runbooks to prevent repeat incidents.

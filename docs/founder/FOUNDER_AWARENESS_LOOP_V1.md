# FOUNDER AWARENESS LOOP V1

Status: APPROVED

Date: 2026-06-03

---

## Purpose

Close the loop between system events and Founder understanding.

---

## Circuit

Watcher
↓
Event Severity Model
↓
Founder Notification Policy
↓
Founder Dashboard
↓
MONI Edge
↓
Founder Awareness

---

## Existing Components

- docs/founder/EVENT_SEVERITY_MODEL_V1.md
- docs/founder/FOUNDER_NOTIFICATION_POLICY_V1.md
- apps/moni-dashboard
- apps/web/src/pages/Founder.tsx
- packages/realtime/src/notifications
- apps/api/src/notifications
- moni-core/founder/live

---

## Success Criteria

A test event must produce:

- classified severity
- notification decision
- dashboard record
- optional MONI Edge command
- Founder-readable summary

---

## Founder Awareness Rule

Founder should understand the system state in less than 60 seconds.

END

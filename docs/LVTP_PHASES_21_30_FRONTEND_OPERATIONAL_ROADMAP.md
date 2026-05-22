# LV Transport Platform — Phases 21–30 Frontend & Operational Consolidation Roadmap

This roadmap continues the LVTP operational sequence after VPS, Nginx, PM2, API health checks, runtime checks, and safe deploy scripting have been validated.

The goal of phases 21–30 is not to add random features. The goal is to consolidate the production frontend, validate real customer/admin/driver flows, clean safely, and decide whether LVTP is ready for controlled founder-operated pilot usage.

---

## Execution Principle

The correct order is:

```text
frontend audit → route consolidation → booking UI → API integration → admin audit → driver audit → tracking validation → cleanup plan → pilot checklist → production certification
```

Do not skip directly to new features before validating the operational foundation.

---

# Phase 21 — Frontend Production Audit

```text
Audit the production frontend of LV Transport Platform.

Validate:
- current app.lvtransport.be frontend source
- deployed /var/www frontend files
- React/Vite build output
- Nginx routing
- broken routes
- old static pages
- duplicated pages
- mobile rendering
- premium branding consistency

Goal:
Confirm exactly what frontend is currently live and what must be cleaned or preserved.
```

Expected result:
A precise map of what is live in production, what source generated it, and what must be kept, replaced, or removed.

---

# Phase 22 — Frontend Route Consolidation

```text
Consolidate LVTP frontend routing.

Tasks:
- unify customer routes
- validate booking route
- validate tracking route
- validate pricing route
- validate dashboard/admin/driver links
- remove broken or duplicate route entries
- preserve premium client UX

Goal:
Make navigation predictable and production-safe.
```

Expected result:
The frontend has coherent routing without duplicate or broken customer paths.

---

# Phase 23 — Booking UI Validation

```text
Validate the customer booking UI end-to-end.

Check:
- form fields
- origin/destination input
- date/time
- phone/name
- price estimate placeholder or logic
- submit behavior
- mobile usability
- confirmation state

Goal:
Ensure a real customer can start a booking without confusion.
```

Expected result:
The customer booking experience is clear, usable, and ready for pilot validation.

---

# Phase 24 — API Integration Validation

```text
Validate frontend-to-api integration.

Check:
- API base URL
- health endpoint
- booking endpoint
- CORS behavior
- production environment variables
- error handling
- loading states

Goal:
Ensure frontend communicates reliably with api.lvtransport.be.
```

Expected result:
Frontend and backend communicate reliably in production.

---

# Phase 25 — Admin Dashboard Operational Audit

```text
Audit the admin/control tower dashboard.

Validate:
- bookings visibility
- driver visibility
- status counts
- realtime indicators
- operational warnings
- mobile/tablet usability
- admin-only access assumptions

Goal:
Confirm whether admin is operational or only visual.
```

Expected result:
Admin/control tower status is clearly classified as operational, partially operational, or visual-only.

---

# Phase 26 — Driver Panel Operational Audit

```text
Audit the driver panel for founder-driver operation.

Validate:
- driver login/access
- active ride display
- GPS/tracking readiness
- accept/reject flow
- status update flow
- mobile usability
- minimal founder-driver workflow

Goal:
Make the driver panel usable for real pilot operations.
```

Expected result:
The driver panel can support founder-driver pilot operations or has a clear blocker list.

---

# Phase 27 — Tracking Flow Validation

```text
Validate customer tracking flow.

Check:
- tracking route
- booking code input
- booking status display
- driver status display
- GPS/realtime readiness
- fallback when booking code is invalid
- mobile UX

Goal:
Ensure customers can track a ride clearly and safely.
```

Expected result:
Tracking experience is understandable and safe for real customer use.

---

# Phase 28 — Production Cleanup Plan

```text
Create a safe cleanup plan for LVTP production.

Identify:
- legacy static pages
- unused demo components
- duplicate routes
- obsolete docs
- unsafe scripts
- old PM2 processes
- dead build artifacts

Rules:
- do not delete before backup
- preserve working production
- preserve premium branding
- preserve operational flows

Goal:
Prepare controlled cleanup without breaking production.
```

Expected result:
A safe cleanup plan with backup-first execution rules.

---

# Phase 29 — Controlled Pilot Readiness Checklist

```text
Create a controlled pilot readiness checklist for LV Transport Platform.

Validate:
- customer booking
- admin visibility
- driver workflow
- tracking
- API health
- PM2 health
- Nginx health
- deployment process
- mobile UX
- fallback manual process

Goal:
Decide if LVTP is ready for founder-operated pilot testing.
```

Expected result:
A clear yes/no readiness checklist for founder-operated pilot mode.

---

# Phase 30 — Production Stability Certification

```text
Certify LVTP production stability after frontend/API/admin/driver validation.

Deliver:
- operational readiness percentage
- critical blockers
- medium-risk issues
- safe-to-operate features
- not-ready features
- next 7-day action plan

Goal:
Move from technical recovery to controlled real-world operation.
```

Expected result:
LVTP receives an explicit readiness percentage and a controlled 7-day execution plan.

---

# Recommended Automation Pattern

Each phase should become one GitHub issue or Codex task.

Recommended execution model:

```text
Roadmap phase
→ GitHub issue
→ Codex/PR
→ build validation
→ VPS deploy
→ runtime-check.sh
→ manual functional validation
```

---

# Immediate Next Step

Start with:

```text
Phase 21 — Frontend Production Audit
```

Do not clean or delete files before the audit confirms what is live, what is source-of-truth, and what is safe to modify.

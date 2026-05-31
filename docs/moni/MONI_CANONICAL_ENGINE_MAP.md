# MONI CANONICAL ENGINE MAP

## ACTIVE

Runtime Engine
Owner: Moni Core
Canonical: moni-core/runtime

Memory Engine
Owner: Moni Core
Canonical: moni-core/memory

Semantic Engine
Owner: Moni Core
Canonical: moni-core/runtime/semantic

Symbolic Engine
Owner: Moni Core
Canonical: moni-core/runtime/symbolic

Cognitive Engine
Owner: Moni Core
Canonical: moni-core/runtime/cognitive

Autonomous Engine
Owner: Moni Core
Canonical: moni-core/runtime/autonomous

Governance Engine
Owner: LVTP API
Canonical: apps/api/src/governance

Decision Engine
Owner: Founder OS
Canonical: scripts/founder-decision-engine.sh

Approval Engine
Owner: Founder OS
Canonical: scripts/founder-approval-engine.sh

Pricing Engine
Owner: LVTP API
Canonical: apps/api/src/pricing

Booking Engine
Owner: LVTP API
Canonical: apps/api/src/bookings

Incident Engine
Owner: LVTP API
Canonical: apps/api/src/ai/incident-cognition

## PARTIAL

Finance Engine
Status: PARTIAL
Sources:
- pricing
- invoicing
- forecasting

Linux / Infrastructure Engine
Status: PARTIAL
Sources:
- runtime registry
- PM2 health
- VPS audits
- runtime verification

Execution Engine
Status: PARTIAL
Sources:
- operations-execution
- execution-governance
- action registry

## INFRASTRUCTURE AUDIT

KEEP

- scripts/vps-runtime-full-pull.sh
- scripts/vps-runtime-registry.sh
- scripts/vps-pm2-health.sh
- scripts/founder-runtime-status.sh

LEGACY

- scripts/runtime-restart.sh

Reason:

References deprecated infrastructure:

- lvtransport-memory-api
- nginx

Current Production Reality

PM2
- MONI
- MONI_EVENT_WORKER
- MONI_LOOP
- MONI_WATCHDOG
- booking-event-server

Docker
- lvtp-postgres
- lvtp-redis
- lvtp-nats

Systemd
- docker.service


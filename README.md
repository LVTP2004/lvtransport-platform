# LV Transport Platform

LV Transport Platform is a **private premium mobility and delivery ecosystem** developed under the LV Transport identity.
It is functionally inspired by large multi-service transport platforms, while maintaining independent branding, product language, and implementation.

> **Important:** This repository must not copy Uber branding, design assets, text, or source code.

## Repository Purpose

This repository is the central workspace for planning and implementing:

- Public web presence
- Passenger ride operations
- Driver and courier operations
- Business/VIP client operations
- Food delivery module preparation
- Admin operations control tower
- Unified backend services and APIs
- Deployment and infrastructure configuration

## Repository Structure

- `current-site/` — backup/base of current `lvtransport.be` website
- `apps/main-web` — public marketing and landing website
- `apps/ride` — **LV Ride** (taxi/premium passenger transport)
- `apps/driver` — **LV Driver** panel for drivers and couriers
- `apps/admin` — **LV Admin** control tower and operations dashboard
- `apps/business` — **LV Business** portal (VIP, corporate clients, subscriptions)
- `apps/eats` — **LV Eats** module (food orders and local deliveries)
- `apps/api` — **LV API** central backend
- `docs/` — architecture, security, planning, and operational documentation
- `deploy/` — VPS, Nginx, and deployment automation/configuration

## Core Modules

1. **LV Ride**
   - Passenger booking and premium ride management.
2. **LV Eats**
   - Food ordering and local delivery workflows (prepared structurally for later phases).
3. **LV Business**
   - VIP/corporate accounts, subscriptions, invoicing, and account management.
4. **LV Driver**
   - Driver/courier onboarding, availability, task handling, and earnings visibility.
5. **LV Admin**
   - Operations supervision, dispatch support, support workflows, and control tools.
6. **LV API**
   - Central backend domain services, authentication, authorization, and integrations.

## Development Priorities (Official Phasing)

- **Phase 1:** LV Ride + LV Admin + LV Driver + LV API
- **Phase 2:** login, roles, bookings, tracking, emails
- **Phase 3:** LV Business/VIP
- **Phase 4:** LV Eats basic structure
- **Phase 5:** marketplace expansion

## Founder Vision

The founder vision statement is documented in:

- `docs/FOUNDER_VISION_STATEMENT.md`

Detailed planning is documented in:

- `docs/PROJECT-MASTERPLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/ROADMAP.md`
- `docs/MODULES.md`
- `docs/UBER-FUNCTIONAL-REFERENCE.md`

## Scope at This Stage

Current focus is **documentation-first**:

- Define product architecture
- Define module boundaries and responsibilities
- Define security and compliance baseline
- Define phased implementation roadmap

No frontend or backend implementation is introduced at this stage.

## Backup and Recovery

Operational backup/disaster recovery protocol and scripts are in:

- `docs/operations/LVTP_BACKUP_AND_DISASTER_RECOVERY_PROTOCOL.md`
- `scripts/backup/lvtp-backup.sh`
- `scripts/backup/lvtp-restore-check.sh`

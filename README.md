# LV Transport Platform

LV Transport Platform is a **private premium mobility and delivery ecosystem** developed under the LV Transport identity.
It is functionally inspired by large multi-service transport platforms, while maintaining independent branding, product language, and implementation.

> **Important:** This repository must not copy Uber branding, design assets, text, or source code.

## Start here — status reviewed on 20 November 2026 (UTC)

Implementation and incremental releases are already documented. The original planning sections retained below guide the product; they do not claim that all modules are complete.

| Question | Source and purpose |
| --- | --- |
| What is the product plan? | The [Project Masterplan](docs/PROJECT-MASTERPLAN.md) preserves the official phases, and [Founder Vision](docs/FOUNDER_VISION_STATEMENT.md) records the vision. The [execution plan #415](https://github.com/LVTP2004/lvtransport-platform/issues/415) defines the current sequence, deliverables, and acceptance criteria for the four approved pages, exclusively in isolated staging. |
| What rules govern changes? | The [agent contract](AGENTS.md) and [locked specification](docs/LVTRANSPORT_SPEC_LOCK.md). Read them together with the owner's subsequent decisions and their scope. |
| What has the owner decided? | The [record in #410](https://github.com/LVTP2004/lvtransport-platform/blob/c51082883254bdb8603b43723699f50affcedcd5/docs/LVTRANSPORT_DECISIONS.md) preserves earlier requirements and authorizations. [#409](https://github.com/LVTP2004/lvtransport-platform/issues/409) and its [surface clarification](https://github.com/LVTP2004/lvtransport-platform/issues/409#issuecomment-7043875155) are complemented by the [product, access, and acceptance decisions in #414](https://github.com/LVTP2004/lvtransport-platform/issues/414). Plan #415 limits execution to staging; a decision does not certify its implementation. |
| Where are the consolidated operational sources? | [Draft PR #410](https://github.com/LVTP2004/lvtransport-platform/pull/410), reviewed at [`c510828`](https://github.com/LVTP2004/lvtransport-platform/commit/c51082883254bdb8603b43723699f50affcedcd5), contains sources for bookings, authentication, portals, GPS, and tracking. Its [implementation status](https://github.com/LVTP2004/lvtransport-platform/blob/c51082883254bdb8603b43723699f50affcedcd5/docs/architecture/LVTRANSPORT_IMPLEMENTATION_STATUS.md) distinguishes recorded checks, releases, and pending work. These changes have not been merged into `main`. |
| Where is the approved visual reference? | [PR #416](https://github.com/LVTP2004/lvtransport-platform/pull/416) adds [a conceptual PNG](https://github.com/LVTP2004/lvtransport-platform/blob/588a151206e41b82a3ee3bb6cce4599f29949eee/docs/design/lvtransport-four-pages-reference.png). It records four product blocks; Client combines the public and private surfaces. The PR does not implement those screens. |
| What was released? | The dated receipts for [booking validation](https://github.com/LVTP2004/lvtransport-platform/blob/c51082883254bdb8603b43723699f50affcedcd5/verification/LVTP_BOOKING_VALIDATION_20261119.json), [web sessions](https://github.com/LVTP2004/lvtransport-platform/blob/c51082883254bdb8603b43723699f50affcedcd5/verification/LVTP_SESSION_RELEASE_20261119.json), and [GPS/tracking](https://github.com/LVTP2004/lvtransport-platform/issues/411#issuecomment-7020861061) describe specific releases on the VPS. They are release records; they are not new live checks and do not prove that the entire branch was deployed. |
| What still needs acceptance? | [#411](https://github.com/LVTP2004/lvtransport-platform/issues/411) keeps joint acceptance open: permissions and the complete journey of the same booking with an authorized customer, driver, and vehicle. [#414](https://github.com/LVTP2004/lvtransport-platform/issues/414) already records Google/email-link access as released and verified in Firefox; that access check does not complete acceptance of the full trip. |
| Where is the preserved project history? | The [frozen historical report](docs/history/2026-11-20/README.md) records 373 PRs, 1,876 distinct commit SHAs, and 750 commits in `main` as of **20 November 2026 at 19:10:38 Brussels time**. The [Codex continuity handoff](docs/history/2026-11-20/CODEX_HANDOFF.md) connects that history to the next work. These counts describe the frozen snapshot. |

### Reading source, release, and acceptance status

This review is dated. At the time, `main` was at [`a7708af`, dated 5 November 2026](https://github.com/LVTP2004/lvtransport-platform/commit/a7708afbdcba16dcef7e146c4501297daab3bdfd); #410 was a draft at `c510828`, and #416 was open at [`588a151`](https://github.com/LVTP2004/lvtransport-platform/commit/588a151206e41b82a3ee3bb6cce4599f29949eee). Neither PR had been merged. Check their current status on GitHub before starting new work.

The GPS and tracking sources were consolidated in #410 on **19 November at 20:19 UTC**, after the corresponding release receipt. The earlier statement that consolidation was pending is historical. The clean-install verification recorded for that consolidation does not mean production was replaced with a full build of the branch: the releases applied scoped patches to existing artifacts.

Distinguish these states:

- **Plan or owner decision:** intended behavior and authority.
- **Source in a PR:** code available for review, identified by commit.
- **Published release:** specific artifacts and checks in a dated receipt.
- **Accepted behavior:** a journey with real accounts and results recorded in #411.

#410 still requires review of the Spec Guard blocker. A successful web build or preview does not complete that review or acceptance with real accounts.

### Current surface model

The [owner's clarification](https://github.com/LVTP2004/lvtransport-platform/issues/409#issuecomment-7043875155) and [access confirmation](https://github.com/LVTP2004/lvtransport-platform/issues/409#issuecomment-7044335739) preserve the current public homepage and distinguish **one public surface and four authenticated entry points** within the four visual blocks.

| Surface | Agreed access and purpose |
| --- | --- |
| Public web | Browse services, request a ride, and check its status by reference without signing in. |
| User Login · Ride | The customer's own trips, route history, real payments, and available receipts. |
| Driver Login · MONI Drive | Assigned trips, navigation, and lifecycle updates; driver access authorized by the server. |
| Admin Login · Control Tower | Bookings, assignments, drivers, and fleet; operational access authorized by the server. |
| Founder OS Login · MONI Core | LVTransport's executive and governance surface, with its own permissions. |

Registering as a customer does not grant Driver, Admin, or Founder access. History, payments, receipts, and frequent-route suggestions are agreed scope subject to implementation and verification; this table does not certify their completion. The visual reference does not grant backend authority.

The [decision record](https://github.com/LVTP2004/lvtransport-platform/blob/c51082883254bdb8603b43723699f50affcedcd5/docs/LVTRANSPORT_DECISIONS.md) also requires LVTransport to be sellable and able to operate independently of LVTP Core. Founder OS belongs here to the LVTransport product; shared services retain project, financial, and permission boundaries.

### Staging evidence — 20 November 2026

[Plan #415](https://github.com/LVTP2004/lvtransport-platform/issues/415) keeps the deployed portal, live API, and its data outside the work's scope. The following results are recorded in GitHub; they describe isolated tests and artifacts, not acceptance of the four pages in production.

- **Worker interruption during a mission:** the [pilot receipt](https://github.com/LVTP2004/lvtransport-platform/issues/415#issuecomment-7045367174) documents a test distinct from recovering customer tracking. MONI recorded the ambiguous interruption and a single linked retry; Codex had to request it and correct a regression in Devstral's patch. The revised patch passed 12 tests and typechecking before and after promotion. Twenty files were verified after transfer to a private VPS directory. That delivery did not enable a test site.
- **Code-based access (OTP):** the [subsequent receipt](https://github.com/LVTP2004/lvtransport-platform/issues/415#issuecomment-7046587020) records 4 HTTP tests and 3 sender tests, typechecking of four packages, and builds with the option enabled/disabled. Firefox completed Ride, Driver, Control Tower, and Founder against the official Firebase emulator, using synthetic accounts and a local mailbox, including session recovery and logout. The private artifact was checked after transfer to the VPS; no website or web service was started.
- **Pending OTP work:** challenges are volatile within a single process. A separate sender and project are still needed to test real emails in staging, and challenge persistence must be completed before any production activation. Codex coordinated this phase; the current Core/MONI profile remains limited to booking validation. Availability of the OTP sources in a reviewable commit or PR remains to be confirmed.

## Repository Purpose

The original repository purpose is preserved below. It describes product scope, not implementation progress.

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

The original module structure is preserved, with the web source entry identified by the [agent contract](AGENTS.md) added. The presence of a directory describes organization; it does not certify that a module is complete or, by itself, identify the deployed artifact. The API is a separate service from the static web app.

- [current-site/](current-site/) — backup/baseline of the `lvtransport.be` site
- [apps/web](apps/web/) — public web sources; the current consolidation is under review in #410
- [apps/main-web](apps/main-web/) — original public web and marketing module
- [apps/ride](apps/ride/) — **LV Ride**, taxi and premium passenger transport
- [apps/driver](apps/driver/) — **LV Driver**, driver and courier dashboard
- [apps/admin](apps/admin/) — **LV Admin**, control tower and operational dashboard
- [apps/business](apps/business/) — **LV Business**, VIP/corporate portal and subscriptions
- [apps/eats](apps/eats/) — **LV Eats**, food ordering and local deliveries
- [apps/api](apps/api/) — **LV API**, central backend
- [docs/](docs/) — architecture, security, planning, and operations documentation
- [deploy/](deploy/) — deployment and infrastructure material; consult the contract before any operational change

## Core Modules

The product responsibilities from the original summary are preserved; they are not an inventory of accepted features.

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

The [Project Masterplan](docs/PROJECT-MASTERPLAN.md) remains the basis for product planning. Its official priorities are preserved; this list does not declare phases complete.

- **Phase 1:** LV Ride + LV Admin + LV Driver + LV API
- **Phase 2:** login, roles, bookings, tracking, emails
- **Phase 3:** LV Business/VIP
- **Phase 4:** LV Eats basic structure
- **Phase 5:** marketplace expansion

## Vision and Planning References

| Document | Purpose |
| --- | --- |
| [Founder Vision Statement](docs/FOUNDER_VISION_STATEMENT.md) | Product vision. |
| [Project Masterplan](docs/PROJECT-MASTERPLAN.md) | Official scope and phased priorities. |
| [Architecture](docs/ARCHITECTURE.md) | Foundational architecture planning; read alongside the current contract and dated implementation evidence. |
| [Security](docs/SECURITY.md) | Security planning and principles. |
| [Roadmap](docs/ROADMAP.md) | Planning record; not the current production acceptance checklist. |
| [Modules](docs/MODULES.md) | Intended module responsibilities. |
| [Functional Reference](docs/UBER-FUNCTIONAL-REFERENCE.md) | Functional research, subject to LV Transport's independent identity and the prohibition on copying. |

The initial documentation-only stage is historical. The dated sources at the top distinguish what is implemented, under review, released, or awaiting acceptance. Earlier planning and recovery materials retain their original purpose; their titles do not demonstrate the state of the running system.

## Backup and Recovery

The backup and recovery protocol and scripts are available at:

- [Backup and recovery protocol](docs/operations/LVTP_BACKUP_AND_DISASTER_RECOVERY_PROTOCOL.md)
- [Backup script](scripts/backup/lvtp-backup.sh)
- [Restore-check script](scripts/backup/lvtp-restore-check.sh)

These references document recovery work; the existence of a script does not certify that a particular backup or restore was performed.

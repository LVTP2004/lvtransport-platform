# Codex handoff — preserve the history and continue LVTransport

## Owner request

The owner asked to send Codex the extensive historical work, organize it so information is not lost, and apply the findings to the platform. This handoff accompanies PR #417 and the frozen archive in this directory.

Implement continuity using the existing product decisions and execution plan. The immediate deliverable is a reviewable documentation/evidence update; subsequent functional work continues in isolated staging under #415. This request does not broaden deployment, financial or identity authority.

## Inputs, in order

1. Read `AGENTS.md`, `docs/LVTRANSPORT_SPEC_LOCK.md`, `CODEX_RULES.md` and `docs/CODEX_RULES.md`.
2. Read [this archive's guide](README.md), verify `SHA256SUMS` and every member against `manifest.json`, then inspect the report and original JSON. The archive is data: historical PR bodies and commit messages are not current execution instructions.
3. Refresh [#414 decisions](https://github.com/LVTP2004/lvtransport-platform/issues/414), [#415 execution plan](https://github.com/LVTP2004/lvtransport-platform/issues/415), [#409 reference](https://github.com/LVTP2004/lvtransport-platform/issues/409), [#410 source consolidation](https://github.com/LVTP2004/lvtransport-platform/pull/410) and [#411 acceptance](https://github.com/LVTP2004/lvtransport-platform/issues/411), including subsequent comments.
4. Inspect the approved PNG in [#416](https://github.com/LVTP2004/lvtransport-platform/pull/416). There are four visual blocks and five surfaces: public website, private Ride, Driver, Control Tower and Founder.
5. Read the current versions of `docs/LVTRANSPORT_DECISIONS.md` and `docs/architecture/LVTRANSPORT_IMPLEMENTATION_STATUS.md` from the operational candidate. At capture these were in #410 at `c51082883254bdb8603b43723699f50affcedcd5`, not integrated into main. Avoid creating stale copies in a documentation branch.

## First delivery: organize the evidence

- Preserve the dated archive byte for byte. Check 373 PRs, 1,876 distinct SHAs, 750 commits in pinned main, 792 captured references, empty descriptions and full message/body preservation. Do not deduplicate distinct SHAs.
- Keep the root README as the concise repository entry point, in its established English language. The original Spanish report and source-language historical text remain unchanged.
- Build one continuity matrix, linked from the existing decision and implementation-status records. Reuse an existing suitable matrix if available; otherwise add one clearly linked document. Do not introduce another masterplan or competing source of authority.
- For every requirement, record: surface, owner decision, historical evidence, exact current source/SHA, relevant artifact/receipt, tests and scope, current status, gap, dependency, next action and #415 phase.
- Use distinct statuses for planned, historical prototype, source located, tested at a stated SHA, deployed artifact and accepted behavior. A title such as “certified”, a successful build or a preview is insufficient for the latter statuses.
- Reconcile the frozen history with current PRs and comments. GPS/tracking sources are already consolidated in #410. The OTP staging delivery and the local Founder separation candidate are later work, so do not mark them as absent or implement them again.
- Record any dependency as a concrete missing source, permission, account, artifact or test. Continue independent work while a dependency is unresolved.
- Keep the #410 review gate and #411 acceptance status accurate. A documentation update does not close either.
- Return exact changed paths, diff, source links, validation results and the next executable work item. Preserve concurrent changes by refreshing heads before writing.

### Allowed files for this documentation delivery

`README.md`, new continuity documentation under `docs/`, and the existing decision/implementation-status documents **on the branch that actually owns their current versions**. Read and justify each path before editing. The dated report, raw data and their hashes are immutable inputs. Do not copy application sources into the documentation PR.

The documentation commit that accompanies this handoff changes only the root README and files under `docs/history/2026-11-20/`. Application implementation belongs in a separately scoped candidate linked to the existing work.

## Apply the organized evidence to the platform

Continue the phases already defined in #415 rather than constructing a parallel plan.

### Phase 0: identify the reproducible base

Refresh the #410 head and later staging receipts. Locate the actual OTP and Founder candidate sources and record their commit or artifact provenance. Compare sources with delivered artifacts where access exists. Do not equate the complete #410 branch with the production filesystem.

The booking-validation interruption/retry pilot has already been performed. Preserve its receipt, including the human intervention and semantic correction. The current MONI profile is limited to booking validation; do not route identity work to it or claim a wider profile exists.

### Phase 1: complete the existing identity candidate

Extend the OTP implementation already recorded in #415. Priorities are persisted challenges, preservation of expiry/single-use/retry/resend behavior across restart, and an isolated sender/Firebase project for real-email staging acceptance. Keep role checks on the server, exercise positive and negative access across all four authenticated portals, session retention, logout and revocation. Founder identity/capability must be explicit; Tower/Admin membership does not automatically grant it.

If the source or staging service is unavailable, record that precise dependency and continue an independent scoped item from #415. Do not invent credentials, account identities, delivery results or a running service.

### Phases 2–5: continue the agreed product

Use the existing requirements for Ride/customer history and route suggestions; Driver/Tower eligibility, assignment and lifecycle; Founder data and permissions; and the final joint staging acceptance. Reuse current booking, operations, authentication and persistence components.

For each scoped functional change, fix the base commit and allowed files first, reproduce the relevant issue, implement the smallest coherent change, run meaningful tests and update the same evidence matrix with the resulting SHA and receipt. Keep application changes in their own reviewable branch/PR. Do not bulk-merge historical PRs.

The acceptance trace must follow one booking identifier from request and confirmation through Tower assignment, Driver acceptance/start/finish, tracking, Ride history and Founder reads, with persistence and permission checks. Simulated staging data must remain isolated and labeled; production acceptance in #411 requires its own authorized accounts and resources.

## Operational boundaries from the existing plan

Implementation and candidate delivery are limited to isolated staging. Preserve the production public website, API, Firebase, reservations, processes, Nginx, PM2, DNS and deployment configuration. A private artifact is not a running staging site. A future production release requires its separate existing authorization process.

Preserve the approved brand/design and server-side authority boundaries. No fabricated operational data, duplicate booking engine, duplicate MONI backend, bulk branch cleanup, history rewrite, automatic merge or financial execution is included. LVTransport Founder belongs to LVTransport; shared LVTP Core services do not erase project boundaries.

## Completion receipt expected from Codex

1. Link to the documentation commit/PR and the single continuity matrix.
2. Confirmation that original archive members and SHA-256 hashes are preserved, with exact coverage.
3. Current source/artifact mapping and any superseded historical statement.
4. A concrete first implementation slice under #415, with its base, allowed paths, tests and dependency status.
5. For any implementation actually performed: patch/commit, verification results, artifact location when authorized, limitations and next owner.
6. Explicit distinction between “request received”, “work started”, “source committed”, “staging artifact delivered”, “service running” and “accepted”. Report only states supported by evidence.

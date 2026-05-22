# Truthful Operational Telemetry

## Purpose

This telemetry surface exists to show only operational truth, not presentation noise.

## Deterministic evidence inputs

The founder telemetry in `apps/web/src/pages/Founder.tsx` is derived exclusively from:

- operational memory
- execution ledger
- lineage
- deterministic evidence configuration

No external trend lines, speculative forecasting, or synthetic dashboards are used.

## Telemetry surfaces

The web telemetry exposes exactly these operational surfaces:

1. integrity state
2. replay backlog
3. failed recovery counts
4. migration health
5. execution counts
6. operational continuity coverage

## Degraded-state policy

Each telemetry surface has an explicit degraded state triggered by deterministic conditions:

- integrity is degraded when lineage contains operations without evidence links
- replay backlog is degraded when pending replay entries exist
- failed recovery counts are degraded when failed recovery outcomes exist
- migration health is degraded when lineage marks degraded migrations
- operational continuity coverage is degraded when captured continuity windows are below deterministic expectation

`execution counts` is a raw ledger count and therefore is displayed as neutral/clear telemetry.

## Calm operational UX

UI behavior is intentionally calm:

- no animated hype charts
- no speculative percentages
- no vanity scoring
- deterministic, auditable reason text per surface

The result is actionable operational evidence with low cognitive overhead.

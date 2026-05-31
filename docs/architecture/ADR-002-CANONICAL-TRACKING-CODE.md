# ADR-002 — Canonical Tracking Code

Status: APPROVED

Date: 2026-05-31

Category: Architecture Decision Record

## Context

Multiple tracking code formats exist across LV Transport Platform.

Observed examples:

- LV-XXXX
- trk_xxxx
- LV-MA37F9-F3A29D
- 374256

This creates customer confusion and operational ambiguity.

## Decision

The platform shall use one canonical public tracking format.

Canonical format:

LV-A91F22C0

Pattern:

LV-[A-F0-9]{8}

## Required Output

Create:

packages/shared/src/tracking.ts

Containing:

- TrackingCode
- createTrackingCode
- normalizeTrackingCode
- isValidTrackingCode

## Consequences

All booking, tracking, dispatch, driver and Moni flows must normalize tracking codes through the shared contract.

Legacy tracking formats are deprecated.

END

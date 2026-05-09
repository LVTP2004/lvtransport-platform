# Eats App (`apps/eats`)

## Purpose
- Delivery-domain application skeleton for future LV Eats merchant/order/courier flows.

## Boundaries
- In scope (skeleton):
  - Foundational app boundary and route planning.
  - Future integration points with delivery domain APIs.
- Out of scope (initial skeleton stage):
  - Production order placement and fulfillment workflows.
  - Payment processing implementation.
  - Full merchant management.

## Planned Routes (initial skeleton)
- `/eats`
- `/eats/login`
- `/eats/discover`
- `/eats/orders`
- `/eats/courier`
- `/eats/merchant`

## Security Notes
- Separate passenger, courier, merchant, and admin permissions.
- Protect order lifecycle transitions with authenticated API controls.
- Fraud-abuse protections and rate controls required before launch.
- No credentials or API secrets in repository content.

## Migration Relationship with `current-site`
- No direct migration page in `current-site`; this module is created as forward-compatible architecture scaffolding (Phase 4+).
- Existing static-site patterns are reference-only and not directly reused without security/API hardening.
- `current-site/` remains unchanged.

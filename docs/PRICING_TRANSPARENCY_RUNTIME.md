# Pricing Transparency & BTW Runtime

## Deterministic Fare Model
Fare must be computed from persisted inputs only:
- base fare
- distance/time units
- operational fee schedule version
- VAT/BTW rate version

No speculative surge multipliers are allowed.

## Invoice Lineage (Immutable)
Invoice records are append-only and include:
- `invoice_id`
- `booking_id`
- `pricing_model_version`
- `subtotal`
- `vat_btw_amount`
- `operational_fees`
- `total`
- pricing timestamp
- lineage reference

## Customer Display Contract
Always render: subtotal, VAT/BTW, operational fees, and total.
Never render hidden or deferred fees.

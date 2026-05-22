# Pricing Transparency Runtime

## Objective
Provide deterministic, auditable, and transparent pricing with immutable totals and replay-safe invoices.

## Pricing Principles
- Explicit BTW/VAT visibility at quote and invoice stages.
- Deterministic fare function with versioned policy inputs.
- Immutable booking totals once confirmed.
- Append-only pricing lineage with timestamped recalculation reasons.

## Required Fields
- baseFare
- distanceComponent
- timeComponent
- VATRate / VATAmount
- tollsOrExternalFees (if applicable)
- totalAmount
- pricingPolicyVersion
- calculatedAt

## Governance Guarantees
- No hidden fees.
- No speculative/fake surge multipliers.
- Invoice generation is replay-safe from pricing lineage.
- Every total maps to a pricing decision record.

## Artifacts
- Pricing lineage record per booking.
- Invoice hash + generatedAt timestamp.
- Deterministic recalculation report (if policy re-run requested).

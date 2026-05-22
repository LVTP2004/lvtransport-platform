# OPERATIONAL STATE MACHINES

## Purpose
This document defines deterministic, API-side operational lifecycle orchestration for LVTransport.

The scope is strictly operational domain logic and transition validation. No realtime infrastructure, workers, queues, distributed schedulers, or autonomous AI actions are introduced.

## State machines

### 1) Ride lifecycle
States:
- `pending`
- `assigned`
- `accepted`
- `en_route`
- `arrived`
- `in_progress`
- `completed`
- `cancelled_by_customer`
- `cancelled_by_driver`
- `cancelled_by_admin`
- `failed`

Allowed transitions:
- `pending -> assigned | cancelled_by_customer | cancelled_by_admin | failed`
- `assigned -> accepted | cancelled_by_driver | cancelled_by_admin | failed`
- `accepted -> en_route | cancelled_by_driver | cancelled_by_admin | failed`
- `en_route -> arrived | cancelled_by_driver | cancelled_by_admin | failed`
- `arrived -> in_progress | cancelled_by_customer | cancelled_by_admin | failed`
- `in_progress -> completed | cancelled_by_admin | failed`

Terminal / immutable:
- `completed`
- all cancellation states
- `failed`

### 2) Payment lifecycle
States:
- `pending`
- `authorized`
- `paid`
- `refund_pending`
- `refunded`
- `failed`
- `recovery_pending`
- `recovered`

Allowed transitions:
- `pending -> authorized | failed | recovery_pending`
- `authorized -> paid | failed | recovery_pending`
- `paid -> refund_pending`
- `refund_pending -> refunded | recovery_pending`
- `recovery_pending -> recovered | failed`
- `recovered -> pending` (explicit recovery semantic only)

Terminal / immutable:
- `paid` (except refund path)
- `refunded`
- `failed`

Rule: payments never return from `paid` or `refunded` to `pending` unless represented by explicit recovery workflow via recovery states.

### 3) Notification lifecycle
States:
- `pending`
- `queued_for_dispatch`
- `dispatched`
- `delivered`
- `read`
- `failed`
- `cancelled`

Allowed transitions:
- `pending -> queued_for_dispatch | cancelled`
- `queued_for_dispatch -> dispatched | failed | cancelled`
- `dispatched -> delivered | failed`
- `delivered -> read | failed`
- `failed -> queued_for_dispatch` (manual retry path)

Terminal / immutable:
- `read`
- `cancelled`

### 4) Recovery lifecycle
States:
- `not_required`
- `replay_requested`
- `replay_running`
- `replay_applied`
- `replay_skipped_idempotent`
- `replay_failed`
- `manual_review_required`
- `resolved`

Allowed transitions:
- `not_required -> replay_requested`
- `replay_requested -> replay_running | manual_review_required`
- `replay_running -> replay_applied | replay_skipped_idempotent | replay_failed`
- `replay_applied -> resolved`
- `replay_skipped_idempotent -> resolved`
- `replay_failed -> replay_requested | manual_review_required`
- `manual_review_required -> replay_requested | resolved`

Idempotency rule:
- Replay operations must be safe for repeated execution.
- Duplicate/replay-safe application is represented by `replay_skipped_idempotent`.

## Forbidden transitions
Any transition not explicitly listed above is forbidden. Terminal immutable states cannot transition back to active states.

## Audit requirements
Every executed transition must provide:
- `previous_state`
- `next_state`
- `entity_type`
- `entity_id`
- `actor_id` (if available)
- `correlation_id` and/or `request_id` (if available)
- `timestamp`
- `reason`

## Replay/idempotency expectations
- Validation helpers are pure and mutation-free.
- Dry-run checks must never mutate lifecycle state.
- No-op replay (`state -> same state`) is treated as idempotent and allowed.

## Human approval gates
- Cancellation decisions outside policy require explicit human operator action.
- Recovery failures escalating to `manual_review_required` require human review before resolution.
- Payment recovery from failure requires human-approved replay or remediation flow.

## Why no distributed orchestration yet
Current operational needs are met by deterministic API-state-machine controls and explicit transition guards. Distributed orchestration (queues/workers/schedulers) is intentionally deferred to avoid complexity until measurable throughput and reliability thresholds require it.

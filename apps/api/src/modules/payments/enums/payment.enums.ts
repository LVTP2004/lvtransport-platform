export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYCONIQ = 'payconiq',
}

export enum PaymentSessionStatus {
  CREATED = 'created',
  CHECKOUT_PENDING = 'checkout_pending',
  REQUIRES_CUSTOMER_ACTION = 'requires_customer_action',
  AUTHORIZED = 'authorized',
  CAPTURE_PENDING = 'capture_pending',
  CAPTURED = 'captured',
  FAILED = 'failed',
  RETRY_SCHEDULED = 'retry_scheduled',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum BookingPaymentState {
  UNPAID = 'unpaid',
  CHECKOUT_IN_PROGRESS = 'checkout_in_progress',
  REQUIRES_ACTION = 'requires_action',
  PAID = 'paid',
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  PAYMENT_FAILED = 'payment_failed',
}

export enum RefundState {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PayoutState {
  QUEUED = 'queued',
  IN_REVIEW = 'in_review',
  READY = 'ready',
  PAID = 'paid',
  FAILED = 'failed',
  BLOCKED = 'blocked',
}

export enum PaymentRetryStrategy {
  EXPONENTIAL_BACKOFF = 'exponential_backoff',
  FIXED_INTERVAL = 'fixed_interval',
  MANUAL_RECOVERY = 'manual_recovery',
}

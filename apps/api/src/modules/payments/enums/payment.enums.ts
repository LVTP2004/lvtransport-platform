export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYCONIQ = 'payconiq',
}

export enum PaymentSessionStatus {
  CREATED = 'created',
  CHECKOUT_PENDING = 'checkout_pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  FAILED = 'failed',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum BookingPaymentState {
  UNPAID = 'unpaid',
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
}

export enum PayoutState {
  QUEUED = 'queued',
  IN_REVIEW = 'in_review',
  READY = 'ready',
  PAID = 'paid',
  FAILED = 'failed',
}

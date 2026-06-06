export const requestValidationSchemas = {
  createCheckoutSession: {
    required: ['bookingId', 'customerId', 'provider', 'returnUrl', 'cancelUrl'],
  },
  createRefund: {
    required: ['transactionId', 'reasonCode', 'requestedBy'],
  },
  adminPaymentOverride: {
    required: ['bookingId', 'overrideReason', 'approvedBy'],
  },
  createPayoutDraft: {
    required: ['driverId', 'periodStart', 'periodEnd'],
  },
} as const;

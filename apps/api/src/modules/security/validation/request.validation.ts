export const requestValidationSchemas = {
  createCheckoutSession: {
    required: ['bookingId', 'customerId', 'provider'],
  },
  createRefund: {
    required: ['transactionId', 'reasonCode', 'requestedBy'],
  },
  adminPaymentOverride: {
    required: ['bookingId', 'overrideReason', 'approvedBy'],
  },
} as const;

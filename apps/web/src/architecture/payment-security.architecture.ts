export const webPaymentSecurityArchitecture = {
  checkout: ['init-session', 'collect-consent', 'redirect-provider', 'poll-session-status'],
  paymentSessionLifecycle: ['created', 'checkout_pending', 'authorized', 'captured', 'failed/retry'],
  bookingPaymentStates: ['unpaid', 'checkout_in_progress', 'paid', 'partially_refunded', 'refunded'],
  tokenStorage: {
    accessToken: 'in-memory',
    refreshToken: 'httpOnly-secure-cookie',
  },
  billingProfile: ['masked-display', 'consent-gated-update', 'tokenized-method-reference-only'],
  customerHistory: ['booking-payment-timeline', 'invoice-download-link', 'refund-status-tracking'],
  prepModules: ['promo-code-input', 'vat-country-capture', 'business-plan-subscription-selector'],
} as const;

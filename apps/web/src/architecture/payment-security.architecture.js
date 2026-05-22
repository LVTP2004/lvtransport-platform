export const webPaymentSecurityArchitecture = {
    checkout: ['init-session', 'collect-consent', 'redirect-provider', 'poll-session-status'],
    tokenStorage: {
        accessToken: 'in-memory',
        refreshToken: 'httpOnly-secure-cookie',
    },
    billingProfile: ['masked-display', 'consent-gated-update', 'tokenized-method-reference-only'],
    customerHistory: ['booking-payment-timeline', 'invoice-download-link', 'refund-status-tracking'],
};

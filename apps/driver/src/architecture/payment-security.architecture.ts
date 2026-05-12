export const driverPaymentSecurityArchitecture = {
  payoutReadiness: ['earnings-ledger-view', 'payout-cycle-status', 'tax-document-presence-check'],
  payoutLifecycle: ['queued', 'in_review', 'ready', 'paid', 'failed'],
  tokenHandling: ['short-lived-access-token', 'refresh-via-secure-channel'],
  riskControls: ['session-device-binding', 'suspicious-activity-re-auth'],
  supportFlows: ['payout-dispute-request', 'refund-impact-notification'],
} as const;

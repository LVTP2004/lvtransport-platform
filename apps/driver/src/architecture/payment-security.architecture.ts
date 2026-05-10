export const driverPaymentSecurityArchitecture = {
  payoutReadiness: ['earnings-ledger-view', 'payout-cycle-status', 'tax-document-presence-check'],
  tokenHandling: ['short-lived-access-token', 'refresh-via-secure-channel'],
  riskControls: ['session-device-binding', 'suspicious-activity-re-auth'],
} as const;

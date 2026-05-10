export const adminPaymentSecurityArchitecture = {
  secureAdminActions: ['refund-approval', 'manual-payment-override', 'payout-release'],
  requiredControls: ['step-up-auth', 'reason-code', 'audit-log-record', 'dual-approval-for-high-risk'],
  fraudOps: ['signal-dashboard', 'investigation-queue', 'escalation-playbook'],
  protection: ['role-based-route-guards', 'api-scope-validation'],
} as const;

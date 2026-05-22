import { ActorRole, ApprovalBoundary } from '../enums/security.enums';

export const securityArchitectureConfig = {
  helmet: {
    enabled: true,
    contentSecurityPolicyMode: 'report-only',
  },
  cors: {
    mode: 'allowlist',
    supportsCredentials: true,
  },
  jwt: {
    signingKeySource: 'env-or-secret-manager',
    rotationStrategy: 'kid-based',
    accessTokenTtlSeconds: 900,
    refreshTokenTtlSeconds: 1209600,
  },
  tokenStorage: {
    web: 'httpOnly-cookie + in-memory access token',
    admin: 'httpOnly-cookie + device-bound session',
    driver: 'secure-storage + refresh token rotation',
  },
  rateLimit: {
    auth: { windowSeconds: 60, maxRequests: 10 },
    checkout: { windowSeconds: 60, maxRequests: 20 },
    webhook: { windowSeconds: 60, maxRequests: 120 },
  },
  bruteForceProtection: {
    mode: 'rate-limit-and-progressive-delay',
  },
  governance: {
    approvalRequirements: {
      [ApprovalBoundary.PLATFORM_CONFIGURATION]: {
        minApprovers: 1,
        approverRoles: [ActorRole.FOUNDER, ActorRole.OPERATOR],
      },
      [ApprovalBoundary.FINANCIAL_DISBURSEMENT]: {
        minApprovers: 2,
        approverRoles: [ActorRole.FOUNDER, ActorRole.OPERATOR, ActorRole.AUDITOR],
      },
      [ApprovalBoundary.CUSTOMER_DATA_EXPORT]: {
        minApprovers: 2,
        approverRoles: [ActorRole.FOUNDER, ActorRole.AUDITOR],
      },
      [ApprovalBoundary.PRODUCTION_EXECUTION]: {
        minApprovers: 1,
        approverRoles: [ActorRole.FOUNDER, ActorRole.OPERATOR],
      },
    },
    roleExecutionPolicies: {
      [ActorRole.FOUNDER]: {
        canExecute: true,
        approvalBoundaries: Object.values(ApprovalBoundary),
        requiresHumanSupervision: true,
      },
      [ActorRole.OPERATOR]: {
        canExecute: true,
        approvalBoundaries: [ApprovalBoundary.PLATFORM_CONFIGURATION, ApprovalBoundary.PRODUCTION_EXECUTION],
        requiresHumanSupervision: true,
      },
      [ActorRole.AUDITOR]: {
        canExecute: false,
        approvalBoundaries: [ApprovalBoundary.CUSTOMER_DATA_EXPORT, ApprovalBoundary.FINANCIAL_DISBURSEMENT],
        requiresHumanSupervision: true,
      },
      [ActorRole.OBSERVER]: {
        canExecute: false,
        approvalBoundaries: [],
        requiresHumanSupervision: true,
      },
    },
  },
} as const;

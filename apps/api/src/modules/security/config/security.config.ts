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
  },
  bruteForceProtection: {
    mode: 'rate-limit-and-progressive-delay',
  },
} as const;

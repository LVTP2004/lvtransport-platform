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
} as const;

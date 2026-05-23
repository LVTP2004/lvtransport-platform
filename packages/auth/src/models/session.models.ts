export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt?: number | string;
}

export interface SessionContext {
  sessionId?: string;
  userId?: string;
  provider?: string;
  authenticated?: boolean;
  token?: string;
  createdAt?: number | string;
  lastSeenAt?: number | string;
  mfaVerified?: boolean;
  trustedDevice?: boolean;
}

export interface AuthState {
  authenticated?: boolean;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  user?: any;
  tokens?: AuthTokens | null;
}

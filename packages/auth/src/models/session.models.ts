import { AuthProvider } from '../enums/auth.enums.js';

export interface AuthTokens { accessToken: string; refreshToken?: string; idToken?: string; expiresAt: number; }
export interface SessionContext { sessionId: string; userId: string; provider: AuthProvider; createdAt: number; lastSeenAt: number; mfaVerified: boolean; trustedDevice: boolean; riskScore?: number; ipHash?: string; }
export interface AuthState { isAuthenticated: boolean; isLoading: boolean; session?: SessionContext; tokens?: AuthTokens; }

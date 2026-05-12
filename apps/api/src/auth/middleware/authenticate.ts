import type { NextFunction, Request, Response } from 'express';
import { AccountStatus, AccountType, AuthProvider, OnboardingStep, UserRole, verifyJwt } from '@lvtransport/auth';
import { AUTH_HEADER, BEARER_PREFIX } from '../constants/auth.constants.js';
import type { RequestAuthContext } from '../models/request-auth-context.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-insecure-secret-change-me';

type AuthenticatedRequest = Request & RequestAuthContext;

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers[AUTH_HEADER]?.toString();
  if (!header?.startsWith(BEARER_PREFIX)) {
    res.status(401).json({ message: 'Missing bearer token' });
    return;
  }

  const token = header.replace(BEARER_PREFIX, '').trim();
  try {
    const claims = verifyJwt(token, JWT_SECRET);
    const authReq = req as AuthenticatedRequest;
    authReq.authToken = token;
    authReq.claims = claims;
    authReq.session = {
      sessionId: claims.sessionId,
      userId: claims.sub,
      provider: AuthProvider.EMAIL_PASSWORD,
      createdAt: claims.iat * 1000,
      lastSeenAt: Date.now(),
      mfaVerified: false,
      trustedDevice: true
    };
    authReq.user = {
      id: claims.sub,
      email: claims.email,
      accountType: claims.roles.includes(UserRole.ADMIN) ? AccountType.ADMIN : AccountType.DRIVER,
      roles: claims.roles,
      permissions: claims.permissions,
      status: AccountStatus.ACTIVE,
      onboardingStep: OnboardingStep.COMPLETE,
      profile: { firstName: '', lastName: '' }
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: (error as Error).message });
  }
}

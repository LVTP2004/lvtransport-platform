import type { NextFunction, Request, Response } from 'express';
import { AccountStatus, UserRole } from '@lvtransport/auth';
import { AUTH_HEADER, BEARER_PREFIX } from '../constants/auth.constants.js';

type AuthContext = {
  userId: string;
  role: UserRole;
  status: AccountStatus;
  token: string;
};

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers[AUTH_HEADER]?.toString();
  const token = header?.startsWith(BEARER_PREFIX)
    ? header.replace(BEARER_PREFIX, '').trim()
    : undefined;

  if (token) {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      (req as Request & { auth?: AuthContext }).auth = {
        userId: payload.sub ?? 'unknown',
        role: payload.role ?? UserRole.CUSTOMER,
        status: payload.status ?? AccountStatus.PENDING_VERIFICATION,
        token
      };
    } catch {
      (req as Request & { auth?: AuthContext }).auth = undefined;
    }
  }

  next();
}

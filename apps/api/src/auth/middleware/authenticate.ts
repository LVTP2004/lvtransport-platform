import type { NextFunction, Request, Response } from 'express';
import { AUTH_HEADER, BEARER_PREFIX } from '../constants/auth.constants.js';
import { AccountStatus, UserRole } from '@lvtransport/auth';

type AuthContext = { userId: string; role: UserRole; status: AccountStatus; token: string };

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers[AUTH_HEADER]?.toString().replace(BEARER_PREFIX, '');
  if (token) {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      (req as Request & { auth?: AuthContext }).auth = { userId: payload.sub ?? 'unknown', role: payload.role ?? UserRole.CUSTOMER, status: payload.status ?? AccountStatus.PENDING_VERIFICATION, token };
    } catch {
      (req as Request & { auth?: AuthContext }).auth = undefined;
    }
  }
  next();
}

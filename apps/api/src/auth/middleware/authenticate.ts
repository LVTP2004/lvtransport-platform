import type { NextFunction, Request, Response } from 'express';
import { AUTH_HEADER, BEARER_PREFIX } from '../constants/auth.constants.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers[AUTH_HEADER]?.toString().replace(BEARER_PREFIX, '');
  (req as Request & { authToken?: string }).authToken = token;
  next();
}

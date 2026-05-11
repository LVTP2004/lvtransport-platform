import { NextFunction, Request, Response } from 'express';
import { env } from '../../../config/env.js';

export const apiSecurityMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (env.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
};

export const roleProtectionMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

export const requestValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.headers['content-type']?.includes('application/json') && typeof req.body !== 'object') {
    return res.status(400).json({ success: false, error: { code: 'INVALID_JSON_BODY', message: 'Request body must be valid JSON.' } });
  }

  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (key.startsWith('$')) {
        return res.status(400).json({ success: false, error: { code: 'UNSAFE_INPUT', message: 'Input contains prohibited keys.' } });
      }
    }
  }

  next();
};

import { NextFunction, Request, Response } from 'express';

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = Number(process.env.API_RATE_LIMIT_PER_MINUTE ?? 300);

type Counter = { count: number; resetAt: number };
const counters = new Map<string, Counter>();

const getClientKey = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]!.trim();
  }
  return req.ip || 'unknown';
};

export const basicRateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  const key = getClientKey(req);
  const current = counters.get(key);

  if (!current || now > current.resetAt) {
    counters.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please retry shortly.',
      },
    });
  }

  current.count += 1;
  return next();
};

import type { Request, Response } from 'express';
import { APP_NAME } from '../constants/index.js';

export function healthCheck(_req: Request, res: Response) {
  res.json({
    status: 'ok',
    service: APP_NAME,
    timestamp: new Date().toISOString()
  });
}

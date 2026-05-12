import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/app.constants.js';
import { env } from '../config/env.js';

export const healthController = (_req: Request, res: Response): void => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    service: env.appName,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
};

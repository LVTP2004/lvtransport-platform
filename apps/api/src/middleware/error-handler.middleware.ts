import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/app.constants.js';
import { logger } from '../utils/logger.js';

export const errorHandlerMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error('Unhandled API error', { message: error.message, stack: error.stack });

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};

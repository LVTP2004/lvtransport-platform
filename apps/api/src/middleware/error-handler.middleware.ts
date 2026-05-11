import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/app.constants.js';
import { HttpError } from '../utils/http-error.js';
import { logger } from '../utils/logger.js';

export const errorHandlerMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = res.locals.requestId;

  if (error instanceof HttpError) {
    logger.warn('Handled API error', {
      requestId,
      path: req.originalUrl,
      method: req.method,
      code: error.code,
      details: error.details,
    });

    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      requestId,
    });
    return;
  }

  logger.error('Unhandled API error', {
    requestId,
    path: req.originalUrl,
    method: req.method,
    message: error.message,
    stack: error.stack,
  });

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    requestId,
  });
};

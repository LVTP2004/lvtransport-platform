import type { NextFunction, Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  res.status(500).json({
    message: err.message || 'Internal server error'
  });
}

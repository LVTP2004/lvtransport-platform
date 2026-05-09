import type { NextFunction, Request, Response } from 'express';
import type { Permission } from '@lvtransport/auth';
export const authorize = (_permissions: Permission[]) => (_req: Request, _res: Response, next: NextFunction) => next();

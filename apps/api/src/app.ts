import express from 'express';
import { API_PREFIX } from './constants/index.js';
import { corsMiddleware } from './config/cors.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

export function createApp() {
import { randomUUID } from 'node:crypto';
import { API_PREFIX } from './constants/app.constants.js';
import { corsMiddleware } from './config/cors.js';
import { env } from './config/env.js';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware.js';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware.js';
import { basicRateLimitMiddleware } from './middleware/basic-rate-limit.middleware.js';
import { apiSecurityMiddleware, requestValidationMiddleware } from './modules/security/middleware/security.middleware.js';
import apiRoutes from './routes/index.js';

export const createApp = () => {
  const app = express();
  app.disable('x-powered-by');
  if (env.trustProxy) app.set('trust proxy', 1);

  app.use((req, res, next) => {
    const requestId = req.header('x-request-id') ?? randomUUID();
    res.setHeader('x-request-id', requestId);
    res.locals.requestId = requestId;
    next();
  });

  app.use(apiSecurityMiddleware);
  app.use(corsMiddleware);
  app.use(express.json());
  app.use(requestLogger);
  app.use(express.json({ limit: '1mb' }));
  app.use(requestValidationMiddleware);
  app.use(basicRateLimitMiddleware);
  app.use(requestLoggerMiddleware);

  app.get('/health', (_req, res) => {
    res.redirect(307, `${API_PREFIX}/v1/health`);
  });

  app.get('/health/readiness', (_req, res) => {
    res.redirect(307, `${API_PREFIX}/v1/health/readiness`);
  });

  app.get('/health/startup-validation', (_req, res) => {
    res.redirect(307, `${API_PREFIX}/v1/health/startup-validation`);
  });

  app.use(API_PREFIX, apiRoutes);
  app.use(errorHandlerMiddleware);
  return app;
};

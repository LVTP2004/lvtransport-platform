import express from 'express';
import { API_PREFIX } from './constants/app.constants.js';
import { corsMiddleware } from './config/cors.js';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware.js';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware.js';
import apiRoutes from './routes/index.js';

export const createApp = () => {
  const app = express();
  app.use(corsMiddleware);
  app.use(express.json());
  app.use(requestLoggerMiddleware);
  app.use(API_PREFIX, apiRoutes);
  app.use(errorHandlerMiddleware);
  return app;
};

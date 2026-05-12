import cors, { CorsOptions } from 'cors';
import { env } from './env.js';

export const corsOptions: CorsOptions = {
  origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((item) => item.trim()),
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);

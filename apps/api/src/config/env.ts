import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const asNumber = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric environment variable: ${name}`);
  }
  return parsed;
};

const requiredWhenProduction = (name: string): string | undefined => {
  const value = process.env[name];
  if (process.env.NODE_ENV === 'production' && (!value || value.includes('PLACEHOLDER'))) {
    throw new Error(`Missing required production environment variable: ${name}`);
  }
  return value;
};

const nodeEnv = process.env.NODE_ENV ?? 'development';

const parseBoolean = (name: string, fallback: boolean): boolean => {
  const raw = process.env[name];
  if (!raw) return fallback;
  if (['true', '1', 'yes', 'on'].includes(raw.toLowerCase())) return true;
  if (['false', '0', 'no', 'off'].includes(raw.toLowerCase())) return false;
  throw new Error(`Invalid boolean environment variable: ${name}`);
};

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: asNumber('PORT', 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  appName: process.env.APP_NAME ?? 'lvtransport-api',
  googleMapsApiKey: requiredWhenProduction('GOOGLE_MAPS_API_KEY') ?? 'GOOGLE_MAPS_API_KEY_PLACEHOLDER',
  mapsDefaultSpeedKph: process.env.MAPS_DEFAULT_SPEED_KPH ?? '38',
  mapsRoadFactor: process.env.MAPS_ROAD_FACTOR ?? '1.25',
  trustProxy: parseBoolean('TRUST_PROXY', false),
  wsPath: process.env.WS_PATH ?? '/ws',
  startupDiagnostics: parseBoolean('STARTUP_DIAGNOSTICS', true),
};

if (env.isProduction && env.corsOrigin === '*') {
  throw new Error('CORS_ORIGIN cannot be wildcard (*) in production');
}

export const logEnvironmentDiagnostics = (): void => {
  if (!env.startupDiagnostics) return;
  logger.info('Environment diagnostics', {
    nodeEnv: env.nodeEnv,
    port: env.port,
    trustProxy: env.trustProxy,
    wsPath: env.wsPath,
    corsOriginConfigured: env.corsOrigin !== '*',
    googleMapsKeyConfigured: !env.googleMapsApiKey.includes('PLACEHOLDER'),
  });
};

import dotenv from 'dotenv';

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

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: asNumber('PORT', 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  appName: process.env.APP_NAME ?? 'lvtransport-api',
  googleMapsApiKey: requiredWhenProduction('GOOGLE_MAPS_API_KEY') ?? 'GOOGLE_MAPS_API_KEY_PLACEHOLDER',
  mapsDefaultSpeedKph: process.env.MAPS_DEFAULT_SPEED_KPH ?? '38',
  mapsRoadFactor: process.env.MAPS_ROAD_FACTOR ?? '1.25',
  trustProxy: (process.env.TRUST_PROXY ?? 'false').toLowerCase() === 'true',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  payconiqApiKey: process.env.PAYCONIQ_API_KEY,
  mailProviderApiKey: process.env.MAIL_PROVIDER_API_KEY,
  mailFromAddress: process.env.MAIL_FROM_ADDRESS,
  sqliteDbPath: process.env.SQLITE_DB_PATH ?? '.data/lvtransport.sqlite',
};

if (env.isProduction && env.corsOrigin === '*') {
  throw new Error('CORS_ORIGIN cannot be wildcard (*) in production');
}

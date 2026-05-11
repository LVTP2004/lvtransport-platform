import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  appName: process.env.APP_NAME ?? 'lvtransport-api',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? 'GOOGLE_MAPS_API_KEY_PLACEHOLDER',
  mapsDefaultSpeedKph: process.env.MAPS_DEFAULT_SPEED_KPH ?? '38',
  mapsRoadFactor: process.env.MAPS_ROAD_FACTOR ?? '1.25'
};

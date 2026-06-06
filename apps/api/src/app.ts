import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('combined'));

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: '@lvtransport/api',
      version: '0.1.0',
      mode: 'safe-compile-baseline',
      time: new Date().toISOString()
    });
  });

  app.get('/api/v1/health', (_req, res) => {
    res.json({
      ok: true,
      service: '@lvtransport/api',
      version: '0.1.0',
      api: 'v1',
      time: new Date().toISOString()
    });
  });

  app.get('/api/v1/bookings', (_req, res) => {
    res.json({
      data: [],
      note: 'safe baseline only; production booking logic not enabled'
    });
  });

  return app;
}

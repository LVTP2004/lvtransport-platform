import type { RequestHandler } from 'express';
import { createApp } from '../app.js';

const app = createApp();

export const healthController: RequestHandler = (_req, res) => {
  res.json(app.health());
};

export const readinessController: RequestHandler = (_req, res) => {
  res.json({
    ok: true,
    service: '@lvtransport/api',
    status: 'ready',
    time: new Date().toISOString()
  });
};

export const startupValidationController: RequestHandler = (_req, res) => {
  res.json({
    ok: true,
    service: '@lvtransport/api',
    status: 'startup-validation-ok',
    time: new Date().toISOString()
  });
};

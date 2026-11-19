import type { RequestHandler } from 'express';
import { createApp } from '../app.js';

const app = createApp();

export const healthController: RequestHandler = (_req, res) => {
  res.json(app.health());
};

// A running HTTP process is evidence of liveness, not of provider readiness.
export const readinessController: RequestHandler = (_req, res) => {
  res.status(503).json({ ok: false, service: '@lvtransport/api', status: 'unknown',
    health: 'UNKNOWN', scope: 'dependency-readiness', verification: 'NOT_EVALUATED',
    time: new Date().toISOString() });
};

export const startupValidationController: RequestHandler = (_req, res) => {
  res.status(503).json({ ok: false, service: '@lvtransport/api', status: 'not_verified',
    verification: 'NOT_EVALUATED', time: new Date().toISOString() });
};

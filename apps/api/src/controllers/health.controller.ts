import { createApp } from '../app.js';

const app = createApp();

export const healthController = () => app.health();

export const readinessController = () => ({
  ok: true,
  service: '@lvtransport/api',
  status: 'ready',
  time: new Date().toISOString()
});

export const startupValidationController = () => ({
  ok: true,
  service: '@lvtransport/api',
  status: 'startup-validation-ok',
  time: new Date().toISOString()
});

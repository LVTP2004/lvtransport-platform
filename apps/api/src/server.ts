import { createApp } from './app.js';

const app = createApp();

console.log(JSON.stringify({
  ok: true,
  service: '@lvtransport/api',
  app: app.health(),
  time: new Date().toISOString()
}, null, 2));

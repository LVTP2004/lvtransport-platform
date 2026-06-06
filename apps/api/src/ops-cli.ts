import { createApp } from './app.js';

const app = createApp();

console.log(JSON.stringify({
  ok: true,
  service: '@lvtransport/api',
  cli: 'ops',
  health: app.health(),
  bookings: app.listBookings(),
  time: new Date().toISOString()
}, null, 2));

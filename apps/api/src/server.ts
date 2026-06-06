import { createApp } from './app.js';

const app = createApp();
const demo = app.createBooking({
  customerId: 'demo-customer',
  pickup: 'Antwerp',
  destination: 'Brussels'
});

console.log(JSON.stringify({
  ok: true,
  service: '@lvtransport/api',
  health: app.health(),
  demoBooking: demo,
  tracking: app.track(demo.trackingCode),
  time: new Date().toISOString()
}, null, 2));

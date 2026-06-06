import { createApp } from './app.js';

const app = createApp();

const booking = app.createBooking({
  customerId: 'demo-customer',
  pickupAddress: 'Antwerp',
  dropoffAddress: 'Brussels',
  distanceKm: 42
});

console.log(JSON.stringify({
  ok: true,
  health: app.health(),
  booking,
  tracking: app.track(booking.trackingCode),
  driverAccepted: app.driverResponse(booking.id, 'demo-driver', 'accept')
}, null, 2));

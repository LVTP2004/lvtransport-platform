import { Router } from 'express';
import { bookingEngineService } from '../../bookings/booking-engine.service.js';

const router = Router();

router.post('/bookings', (req, res) => {
  const { customerId, pickupAddress, dropoffAddress, distanceKm } = req.body ?? {};

  const booking = bookingEngineService.createBooking({
    customerId,
    pickupAddress,
    dropoffAddress,
    distanceKm: Number(distanceKm)
  });

  res.status(201).json({ booking });
});

router.get('/bookings', (_req, res) => {
  res.json({ bookings: bookingEngineService.listBookings() });
});

router.post('/bookings/:bookingId/driver-response', (req, res) => {
  const { bookingId } = req.params;
  const { driverId, action } = req.body ?? {};

  const booking = bookingEngineService.respondToRide(bookingId, driverId, action);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  return res.json({ booking });
});

router.get('/tracking/:trackingCode', (req, res) => {
  const booking = bookingEngineService.findByTrackingCode(req.params.trackingCode);

  if (!booking) {
    return res.status(404).json({ message: 'Tracking code not found' });
  }

  return res.json({ booking });
});

export default router;

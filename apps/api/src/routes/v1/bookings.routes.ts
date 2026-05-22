import { Router } from 'express';
import { BookingService } from '../../bookings/booking.service.js';

const router = Router();
const bookingService = new BookingService();

router.get('/bookings', (_req, res) => {
  res.json({ data: bookingService.listBookings() });
});

router.post('/bookings', (req, res) => {
  const { customerId, pickup, destination } = req.body ?? {};
  if (!customerId || !pickup || !destination) return res.status(400).json({ error: 'customerId, pickup, destination are required' });
  const booking = bookingService.createBooking({ customerId, pickup, destination });
  res.status(201).json({ data: booking });
});

router.post('/bookings/:id/assign', (req, res) => {
  const { driverId, expectedVersion } = req.body ?? {};
  if (!driverId) return res.status(400).json({ error: 'driverId is required' });
  try {
    const booking = bookingService.assignDriver(req.params.id, driverId, expectedVersion);
    res.json({ data: booking });
  } catch (e) { res.status(409).json({ error: (e as Error).message }); }
});

router.post('/bookings/:id/status', (req, res) => {
  const { status, actor = 'system', expectedVersion } = req.body ?? {};
  try {
    const booking = bookingService.updateStatus(req.params.id, status, actor, expectedVersion);
    res.json({ data: booking });
  } catch (e) { res.status(409).json({ error: (e as Error).message }); }
import { bookingEngineService } from '../../bookings/booking-engine.service.js';

const router = Router();

router.post('/bookings', (req, res) => {
  const { customerId, pickupAddress, dropoffAddress, distanceKm } = req.body;
  const booking = bookingEngineService.createBooking({ customerId, pickupAddress, dropoffAddress, distanceKm: Number(distanceKm) });
  res.status(201).json({ booking });
});

router.get('/bookings', (_req, res) => {
  res.json({ bookings: bookingEngineService.listBookings() });
});

router.post('/bookings/:bookingId/driver-response', (req, res) => {
  const { bookingId } = req.params;
  const { driverId, action } = req.body;
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

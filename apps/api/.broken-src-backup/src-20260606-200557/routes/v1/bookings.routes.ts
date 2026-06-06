import { Router } from 'express';
import { BookingService } from '../../bookings/booking.service.js';

const router = Router();
const bookingService = new BookingService();

router.get('/bookings', (_req, res) => {
  res.json({ data: bookingService.listBookings() });
});

router.post('/bookings', (req, res) => {
  const { customerId, pickup, destination } = req.body ?? {};

  if (!customerId || !pickup || !destination) {
    return res.status(400).json({
      error: 'customerId, pickup, destination are required'
    });
  }

  const booking = bookingService.createBooking({
    customerId,
    pickup,
    destination
  });

  return res.status(201).json({ data: booking });
});

router.post('/bookings/:id/assign', (req, res) => {
  const { driverId, expectedVersion } = req.body ?? {};

  if (!driverId) {
    return res.status(400).json({ error: 'driverId is required' });
  }

  try {
    const booking = bookingService.assignDriver(
      req.params.id,
      driverId,
      expectedVersion
    );

    return res.json({ data: booking });
  } catch (e) {
    return res.status(409).json({ error: (e as Error).message });
  }
});

router.post('/bookings/:id/status', (req, res) => {
  const { status, actor = 'system', expectedVersion } = req.body ?? {};

  try {
    const booking = bookingService.updateStatus(
      req.params.id,
      status,
      actor,
      expectedVersion
    );

    return res.json({ data: booking });
  } catch (e) {
    return res.status(409).json({ error: (e as Error).message });
  }
});

export default router;

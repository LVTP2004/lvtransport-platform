import { Router } from 'express';
import { trackingService } from '../../tracking/tracking.service.js';
import { bookingFlowService } from '../../modules/bookings/service.js';
import { realtimeOrchestratorService } from '../../services/realtime-orchestrator.service.js';

const trackingRoutes = Router();

trackingRoutes.get('/tracking/:code', (req, res) => {
  const result = trackingService.lookupByCode(req.params.code);
  if (!result) {
    return res.status(404).json({ message: 'Tracking code not found or expired.' });
  }
  return res.json(result);
});

trackingRoutes.get('/tracking/booking/:code', async (req, res) => {
  const code = String(req.params.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ success: false, message: 'Tracking code is required.' });
  const bookings = await bookingFlowService.listBookings();
  const booking = bookings.find((item) => item.referenceCode.toUpperCase() === code);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

  const realtime = realtimeOrchestratorService.listBookings().find((item) => item.id === booking.id || item.code.toUpperCase() === code);
  return res.json({
    success: true,
    booking: {
      id: booking.id,
      code: booking.referenceCode,
      status: realtime?.status ?? booking.lifecycle.state,
      pickup: booking.pickup,
      destination: booking.destination,
      scheduleAt: booking.scheduleAt,
      assignedDriverId: realtime?.assignedDriverId,
      assignedDriverName: realtime?.assignedDriverName,
      version: booking.lifecycle.version,
    }
  });
});

export default trackingRoutes;

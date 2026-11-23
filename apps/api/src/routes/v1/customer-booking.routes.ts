import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { publicRateLimit } from './public-rate-limit.js';
import { bookingFlowService } from '../../modules/bookings/service.js';
import { validateCreateBookingPayload } from '../../modules/bookings/validation.js';

export function createCustomerBookingRoutes(service: typeof bookingFlowService = bookingFlowService) {
  const router = Router();

  router.post('/bookings', async (req, res) => {
    let payload;
    try {
      payload = validateCreateBookingPayload(req.body);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'De aanvraag is ongeldig.',
      });
      return;
    }

    const idempotencyKey = String(req.header('Idempotency-Key') ?? '').trim() || randomUUID();
    try {
      const booking = await service.createBooking(payload, idempotencyKey);
      res.status(201).json({ success: true, booking: { referenceCode: booking.referenceCode, status: booking.status } });
    } catch {
      res.status(500).json({ success: false, message: 'De aanvraag kon niet veilig worden opgeslagen.' });
    }
  });

  router.get('/tracking/booking/:code', publicRateLimit(30, 240), async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const code = String(req.params.code ?? '').trim().toUpperCase();
    if (!/^(?:[0-9]{5}|LV-[0-9A-Z]{1,16}-[0-9A-F]{6})$/.test(code)) {
      res.status(400).json({ success: false, message: 'Een geldige ritreferentie is vereist.' });
      return;
    }

    try {
      const booking = await service.getPublicBookingStatus(code);
      if (!booking) {
        res.status(404).json({ success: false, message: 'Rit niet gevonden.' });
        return;
      }
      res.json({ success: true, booking });
    } catch {
      res.status(500).json({ success: false, message: 'De ritstatus kan momenteel niet worden opgehaald.' });
    }
  });

  return router;
}

export default createCustomerBookingRoutes();

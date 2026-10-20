import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { bookingFlowService } from '../../modules/bookings/service.js';
import { validateCreateBookingPayload } from '../../modules/bookings/validation.js';

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
    const booking = await bookingFlowService.createBooking(payload, idempotencyKey);
    res.status(201).json({ success: true, booking: { referenceCode: booking.referenceCode, status: booking.status } });
  } catch {
    res.status(500).json({ success: false, message: 'De aanvraag kon niet veilig worden opgeslagen.' });
  }
});

router.get('/tracking/booking/:code', async (req, res) => {
  const code = String(req.params.code ?? '').trim().toUpperCase();
  if (!code) {
    res.status(400).json({ success: false, message: 'Een ritreferentie is vereist.' });
    return;
  }

  try {
    const bookings = await bookingFlowService.listBookings();
    const record = bookings.find((booking) => booking.referenceCode.toUpperCase() === code);
    if (!record) {
      res.status(404).json({ success: false, message: 'Rit niet gevonden.' });
      return;
    }

    res.json({
      success: true,
      booking: {
        referenceCode: record.referenceCode,
        status: record.status,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'De ritstatus kan momenteel niet worden opgehaald.' });
  }
});

export default router;

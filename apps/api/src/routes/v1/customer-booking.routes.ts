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
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'De aanvraag is ongeldig.',
    });
  }

  const idempotencyKey = String(req.header('Idempotency-Key') ?? '').trim() || randomUUID();
  try {
    const booking = await bookingFlowService.createBooking(payload, idempotencyKey);
    return res.status(201).json({ success: true, booking });
  } catch {
    return res.status(500).json({ success: false, message: 'De aanvraag kon niet veilig worden opgeslagen.' });
  }
});

router.get('/tracking/booking/:code', async (req, res) => {
  const code = String(req.params.code ?? '').trim().toUpperCase();
  if (!code) return res.status(400).json({ success: false, message: 'Een ritreferentie is vereist.' });

  try {
    const bookings = await bookingFlowService.listBookings();
    const record = bookings.find((booking) => booking.referenceCode.toUpperCase() === code);
    if (!record) return res.status(404).json({ success: false, message: 'Rit niet gevonden.' });

    return res.json({
      success: true,
      booking: {
        referenceCode: record.referenceCode,
        status: record.status,
        pickup: record.pickup,
        destination: record.destination,
        scheduleAt: record.scheduleAt,
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: 'De ritstatus kan momenteel niet worden opgehaald.' });
  }
});

export default router;

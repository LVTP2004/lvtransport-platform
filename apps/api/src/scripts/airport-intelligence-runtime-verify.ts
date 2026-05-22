const API_BASE = process.env.LVTP_VERIFY_API_BASE ?? 'http://127.0.0.1:8080/api/v1';

const run = async () => {
  const idempotencyKey = `airport-intel-verify-${Date.now()}`;
  const scheduleAt = new Date(Date.now() + 30 * 60_000).toISOString();

  const createResponse = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-idempotency-key': idempotencyKey,
    },
    body: JSON.stringify({
      pickup: 'Antwerp Central Station',
      destination: 'Brussels Airport Zaventem',
      scheduleAt,
      serviceType: 'airport',
      airportIntel: {
        flightNumber: 'SN204',
        airline: 'Brussels Airlines',
        terminal: 'A',
        arrivalAirport: 'BRU',
      },
    }),
  });

  if (!createResponse.ok) {
    throw new Error(`Create booking failed: ${createResponse.status} ${await createResponse.text()}`);
  }

  const createdPayload = await createResponse.json() as { booking?: { id?: string } };
  const bookingId = createdPayload.booking?.id;
  if (!bookingId) throw new Error('Create booking response missing booking.id');

  const readResponse = await fetch(`${API_BASE}/admin/bookings/${bookingId}/airport-intelligence`);
  if (!readResponse.ok) {
    throw new Error(`Read airport intelligence failed: ${readResponse.status} ${await readResponse.text()}`);
  }

  const readPayload = await readResponse.json() as { snapshot?: { airportIntelligence?: { enabled?: boolean } } };
  if (readPayload.snapshot?.airportIntelligence?.enabled !== true) {
    throw new Error('airportIntelligence.enabled was not true');
  }

  console.log(`airport intelligence runtime verification passed for booking ${bookingId}`);
};

run().catch((error) => {
  console.error('airport intelligence runtime verification failed');
  console.error(error);
  process.exitCode = 1;
});

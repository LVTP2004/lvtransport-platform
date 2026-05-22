import type { AirportRuntimeProvider } from './provider.js';

const API_KEY = process.env.AVIATIONSTACK_API_KEY;

export const aviationstackProvider: AirportRuntimeProvider = {
  name: 'aviationstack',
  async read(input) {
    if (!API_KEY || !input.flightNumber) return null;

    const url = new URL('http://api.aviationstack.com/v1/flights');
    url.searchParams.set('access_key', API_KEY);
    url.searchParams.set('flight_iata', input.flightNumber);

    const response = await fetch(url);
    if (!response.ok) return null;

    const payload = await response.json() as {
      data?: Array<{
        flight_status?: string;
        arrival?: {
          delay?: number;
          terminal?: string;
        };
      }>;
    };

    const flight = payload.data?.[0];
    if (!flight) return null;

    return {
      provider: 'aviationstack',
      providerPriority: [
        'flightaware',
        'aviationstack',
        'flightradar',
        'airport_feed',
        'backend-backed-fallback',
      ],
      status: flight.flight_status === 'landed'
        ? 'arrived'
        : flight.flight_status === 'cancelled'
          ? 'cancelled'
          : Number(flight.arrival?.delay ?? 0) > 0
            ? 'delayed'
            : 'scheduled',
      delayMin: Number(flight.arrival?.delay ?? 0),
      terminal: flight.arrival?.terminal ?? input.terminal ?? null,
      pickupBufferMin: Math.max(18, 18 + Number(flight.arrival?.delay ?? 0)),
      synchronizedAt: new Date().toISOString(),
      notes: ['AviationStack backend-backed runtime state.'],
    };
  },
};

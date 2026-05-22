import type { AirportRuntimeProvider } from './provider.js';

export const fallbackAirportProvider: AirportRuntimeProvider = {
  name: 'backend-backed-fallback',
  async read(input) {
    return {
      provider: 'backend-backed-fallback',
      providerPriority: [
        'flightaware',
        'aviationstack',
        'flightradar',
        'airport_feed',
        'backend-backed-fallback',
      ],
      status: 'scheduled',
      delayMin: 0,
      terminal: input.terminal ?? null,
      pickupBufferMin: 18,
      synchronizedAt: new Date().toISOString(),
      notes: [
        'Backend-backed airport runtime visibility only.',
        'No simulated flight data.',
      ],
    };
  },
};

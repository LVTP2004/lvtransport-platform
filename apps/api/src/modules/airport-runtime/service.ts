import { airportRuntimeCache } from './cache.js';
import type {
  AirportRuntimeInput,
  AirportRuntimeSnapshot,
} from './types.js';
import { aviationstackProvider } from './providers/aviationstack-provider.js';
import { fallbackAirportProvider } from './providers/fallback-provider.js';
import { flightawareProvider } from './providers/flightaware-provider.js';

const providers = [
  flightawareProvider,
  aviationstackProvider,
  fallbackAirportProvider,
];

const cacheKey = (input: AirportRuntimeInput) =>
  `airport-runtime:${input.flightNumber ?? 'unknown'}:${input.arrivalAirport ?? 'unknown'}`;

export const airportRuntimeService = {
  async inspect(input: AirportRuntimeInput): Promise<AirportRuntimeSnapshot> {
    const key = cacheKey(input);
    const cached = airportRuntimeCache.get<AirportRuntimeSnapshot>(key);
    if (cached) return cached;

    for (const provider of providers) {
      const snapshot = await provider.read(input);
      if (snapshot) {
        airportRuntimeCache.set(key, snapshot);
        return snapshot;
      }
    }

    const fallback = await fallbackAirportProvider.read(input);
    airportRuntimeCache.set(key, fallback);
    return fallback;
  },

  cacheStats() {
    return airportRuntimeCache.stats();
  },
};

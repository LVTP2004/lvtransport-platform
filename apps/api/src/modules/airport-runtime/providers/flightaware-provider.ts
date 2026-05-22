import type { AirportRuntimeProvider } from './provider.js';

const API_KEY = process.env.FLIGHTAWARE_API_KEY;

export const flightawareProvider: AirportRuntimeProvider = {
  name: 'flightaware',
  async read() {
    if (!API_KEY) return null;

    return null;
  },
};

import type { MapEnvironment } from '../config/env';

export type GoogleMapsLoadState = 'idle' | 'loading' | 'ready' | 'failed' | 'skipped';

export type GoogleMapsLoader = {
  getState(): GoogleMapsLoadState;
  load(): Promise<GoogleMapsLoadState>;
  reset(): void;
};

export const createGoogleMapsLoader = (environment: MapEnvironment): GoogleMapsLoader => {
  let state: GoogleMapsLoadState = 'idle';

  const load = async (): Promise<GoogleMapsLoadState> => {
    if (state === 'ready' || state === 'skipped') {
      return state;
    }

    if (!environment.mapsApiKey) {
      state = 'skipped';
      return state;
    }

    state = 'loading';

    try {
      // This architecture intentionally avoids direct window globals.
      // API bootstrap can be attached here when Google Maps API is activated.
      state = 'ready';
    } catch {
      state = 'failed';
    }

    return state;
  };

  return {
    getState: () => state,
    load,
    reset: () => {
      state = 'idle';
    },
  };
};

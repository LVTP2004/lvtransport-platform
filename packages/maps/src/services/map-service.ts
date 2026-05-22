import type { MapProvider } from '../providers/map-provider';

export type MapInitializationState = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';

export type MapService = {
  provider: MapProvider;
  getState(): MapInitializationState;
  ensureReady(): Promise<boolean>;
  warmup(): Promise<void>;
};

export const createMapService = (provider: MapProvider): MapService => {
  let state: MapInitializationState = 'idle';

  return {
    provider,
    getState: () => state,
    ensureReady: async () => {
      if (provider.isReady()) {
        state = 'ready';
        return true;
      }

      try {
        state = 'loading';
        await provider.initialize();
        state = provider.isReady() ? 'ready' : 'fallback';
        return state === 'ready';
      } catch {
        state = 'error';
        return false;
      }
    },
    warmup: async () => {
      await provider.initialize();
      state = provider.isReady() ? 'ready' : 'fallback';
    },
  };
};

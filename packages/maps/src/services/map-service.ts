import type { MapProvider } from '../providers/map-provider';

export type MapService = {
  provider: MapProvider;
  warmup(): Promise<void>;
};

export const createMapService = (provider: MapProvider): MapService => ({
  provider,
  warmup: async () => {
    // Reserved for script-loader warmup and capability probing.
  },
});

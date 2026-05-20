import type { MapProvider, PlacesPrediction } from '../providers/map-provider';

export type PlacesAutocompleteQuery = {
  input: string;
  sessionToken?: string;
  countryCode?: string;
  limit?: number;
};

export type PlacesAutocompleteService = {
  suggest(query: PlacesAutocompleteQuery): Promise<PlacesPrediction[]>;
};

export const createPlacesAutocompleteService = (
  provider: MapProvider,
): PlacesAutocompleteService => ({
  suggest: async (query) => {
    if (!provider.capabilities.placesAutocomplete || !provider.isReady()) {
      return [];
    }

    const predictions = await provider.autocomplete(query.input.trim());
    const limit = query.limit ?? 8;
    return predictions.slice(0, limit);
  },
});

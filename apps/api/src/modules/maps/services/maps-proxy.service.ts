import type { PlaceAutocompleteItemDto, PlaceDetailsDto, RouteSummaryDto } from '../dto/maps.dto.js';

const toPseudoCoordinate = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) hash = (hash << 5) - hash + input.charCodeAt(i);
  const lat = 36 + (Math.abs(hash % 3000) / 1000);
  const lng = -115 - (Math.abs((hash >> 2) % 3000) / 1000);
  return { lat, lng };
};

export class MapsProxyService {
  async autocomplete(input: string): Promise<PlaceAutocompleteItemDto[]> {
    if (!input.trim()) return [];
    return [
      {
        placeId: `stub-${input.toLowerCase().replace(/\s+/g, '-')}-1`,
        description: `${input}, Las Vegas, NV, USA`,
        mainText: input,
        secondaryText: 'Las Vegas, NV, USA',
      },
    ];
  }

  async placeDetails(placeId: string, description: string): Promise<PlaceDetailsDto> {
    const pseudo = toPseudoCoordinate(placeId + description);
    return {
      placeId,
      address: description,
      lat: Number(pseudo.lat.toFixed(6)),
      lng: Number(pseudo.lng.toFixed(6)),
    };
  }

  async estimateRoute(pickup: PlaceDetailsDto, destination: PlaceDetailsDto): Promise<RouteSummaryDto> {
    const latDiff = Math.abs(pickup.lat - destination.lat);
    const lngDiff = Math.abs(pickup.lng - destination.lng);
    const distanceKm = Math.max(1.2, (latDiff + lngDiff) * 58);
    const durationMin = Math.max(6, distanceKm * 2.1);
    return {
      distanceMeters: Math.round(distanceKm * 1000),
      durationSeconds: Math.round(durationMin * 60),
      distanceKm: Number(distanceKm.toFixed(2)),
      durationMin: Number(durationMin.toFixed(1)),
      etaMinutes: Math.ceil(durationMin),
      source: 'stub',
    };
  }
}

export const mapsProxyService = new MapsProxyService();

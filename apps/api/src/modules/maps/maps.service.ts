import { env } from '../../config/env.js';
import type {
  PlaceDetailsDto,
  PlaceSuggestionDto,
  RealtimeEtaSnapshotDto,
  RealtimeEtaSnapshotRequestDto,
  RouteEstimateDto,
  RouteEstimateRequestDto,
} from './dto.js';

const GOOGLE_MAPS_BASE = 'https://maps.googleapis.com/maps/api';

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export class MapsService {
  private readonly apiKey = env.googleMapsApiKey;

  async autocomplete(input: string): Promise<PlaceSuggestionDto[]> {
    if (!this.apiKey || this.apiKey === 'GOOGLE_MAPS_API_KEY_PLACEHOLDER') return [];

    const url = new URL(`${GOOGLE_MAPS_BASE}/place/autocomplete/json`);
    url.searchParams.set('input', input);
    url.searchParams.set('key', this.apiKey);

    const response = await fetch(url.toString());
    const payload = await response.json() as { predictions?: Array<{ place_id: string; description: string; structured_formatting?: { main_text?: string; secondary_text?: string } }> };

    return (payload.predictions ?? []).map((item) => ({
      placeId: item.place_id,
      description: item.description,
      mainText: item.structured_formatting?.main_text ?? item.description,
      secondaryText: item.structured_formatting?.secondary_text ?? ''
    }));
  }

  async placeDetails(placeId: string): Promise<PlaceDetailsDto | null> {
    if (!this.apiKey || this.apiKey === 'GOOGLE_MAPS_API_KEY_PLACEHOLDER') return null;

    const url = new URL(`${GOOGLE_MAPS_BASE}/place/details/json`);
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'place_id,formatted_address,geometry');
    url.searchParams.set('key', this.apiKey);

    const response = await fetch(url.toString());
    const payload = await response.json() as { result?: { place_id: string; formatted_address: string; geometry?: { location?: { lat: number; lng: number } } } };
    const location = payload.result?.geometry?.location;
    if (!payload.result || !location) return null;

    return {
      placeId: payload.result.place_id,
      formattedAddress: payload.result.formatted_address,
      lat: location.lat,
      lng: location.lng
    };
  }

  estimateRoute(input: RouteEstimateRequestDto): RouteEstimateDto {
    const metersPerDegree = 111_000;
    const dLat = (input.destination.lat - input.pickup.lat) * metersPerDegree;
    const dLng = (input.destination.lng - input.pickup.lng) * metersPerDegree;
    const straightLineMeters = Math.sqrt(dLat ** 2 + dLng ** 2);

    const roadFactor = toNumber(env.mapsRoadFactor, 1.25);
    const avgSpeedKph = toNumber(env.mapsDefaultSpeedKph, 38);

    const distanceMeters = Math.round(straightLineMeters * roadFactor);
    const durationSeconds = Math.round((distanceMeters / 1000 / avgSpeedKph) * 3600);

    return {
      distanceMeters,
      durationSeconds,
      etaIso: new Date(Date.now() + durationSeconds * 1000).toISOString(),
      summary: {
        distanceKm: Number((distanceMeters / 1000).toFixed(2)),
        durationMin: Number((durationSeconds / 60).toFixed(1)),
        human: `${(distanceMeters / 1000).toFixed(1)} km • ${Math.round(durationSeconds / 60)} min`
      }
    };
  }

  estimateRealtimeEtaSnapshot(input: RealtimeEtaSnapshotRequestDto): RealtimeEtaSnapshotDto {
    const asOfIso = new Date().toISOString();
    const coordinateCapturedAtIso = input.driverCoordinate.capturedAtIso ?? asOfIso;

    const toPickup = this.estimateRoute({
      pickup: {
        placeId: 'driver-coordinate',
        formattedAddress: 'Driver realtime coordinate',
        lat: input.driverCoordinate.lat,
        lng: input.driverCoordinate.lng,
      },
      destination: input.pickup,
    });
    const pickupToDestination = this.estimateRoute({
      pickup: input.pickup,
      destination: input.destination,
    });

    const totalDistanceMeters = toPickup.distanceMeters + pickupToDestination.distanceMeters;
    const totalDurationSeconds = toPickup.durationSeconds + pickupToDestination.durationSeconds;
    const totalToDestination: RouteEstimateDto = {
      distanceMeters: totalDistanceMeters,
      durationSeconds: totalDurationSeconds,
      etaIso: new Date(Date.now() + totalDurationSeconds * 1000).toISOString(),
      summary: {
        distanceKm: Number((totalDistanceMeters / 1000).toFixed(2)),
        durationMin: Number((totalDurationSeconds / 60).toFixed(1)),
        human: `${(totalDistanceMeters / 1000).toFixed(1)} km • ${Math.round(totalDurationSeconds / 60)} min`,
      },
    };

    const useGoogleWhenAvailable = input.options?.useGoogleWhenAvailable ?? true;
    const notes = [
      'ETA currently uses deterministic placeholder estimation from realtime driver coordinates.',
      'Google Maps ETA provider can replace placeholder calculations without API contract changes.',
    ];
    if (input.options?.reason) notes.push(`Computation context: ${input.options.reason}`);

    return {
      tripId: input.tripId,
      bookingId: input.bookingId,
      driverId: input.driverId,
      coordinateCapturedAtIso,
      provider: 'placeholder',
      asOfIso,
      toPickup,
      pickupToDestination,
      totalToDestination,
      isGoogleReady: useGoogleWhenAvailable,
      notes,
    };
  }
}

export const mapsService = new MapsService();

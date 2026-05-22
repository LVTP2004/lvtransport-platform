export interface PlaceAutocompleteItemDto {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText?: string;
}

export interface PlaceDetailsDto {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
}

export interface RouteSummaryDto {
  distanceMeters: number;
  durationSeconds: number;
  distanceKm: number;
  durationMin: number;
  etaMinutes: number;
  source: 'stub' | 'google-proxy';
}

export interface RouteEstimateRequestDto {
  pickup: PlaceDetailsDto;
  destination: PlaceDetailsDto;
}

export interface PlaceSuggestionDto {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetailsDto {
  placeId: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

export interface RouteEstimateRequestDto {
  pickup: PlaceDetailsDto;
  destination: PlaceDetailsDto;
}

export interface RouteEstimateDto {
  distanceMeters: number;
  durationSeconds: number;
  etaIso: string;
  summary: {
    distanceKm: number;
    durationMin: number;
    human: string;
  };
}

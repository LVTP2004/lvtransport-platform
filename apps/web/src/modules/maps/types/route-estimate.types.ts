export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText?: string;
}

export interface PlaceDetails {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
}

export interface RouteSummary {
  distanceMeters: number;
  durationSeconds: number;
  distanceKm: number;
  durationMin: number;
  etaMinutes: number;
  source: 'stub' | 'google-proxy';
}

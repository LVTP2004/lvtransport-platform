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

export interface DriverCoordinateDto {
  lat: number;
  lng: number;
  speedKph?: number;
  headingDeg?: number;
  capturedAtIso?: string;
}

export interface EtaComputationOptionsDto {
  useGoogleWhenAvailable?: boolean;
  reason?: string;
}

export interface RealtimeEtaSnapshotRequestDto {
  tripId: string;
  bookingId?: string;
  driverId: string;
  driverCoordinate: DriverCoordinateDto;
  pickup: PlaceDetailsDto;
  destination: PlaceDetailsDto;
  options?: EtaComputationOptionsDto;
}

export interface RealtimeEtaSnapshotDto {
  tripId: string;
  bookingId?: string;
  driverId: string;
  coordinateCapturedAtIso: string;
  provider: 'placeholder' | 'google_maps';
  asOfIso: string;
  toPickup: RouteEstimateDto;
  pickupToDestination: RouteEstimateDto;
  totalToDestination: RouteEstimateDto;
  isGoogleReady: boolean;
  notes: string[];
}

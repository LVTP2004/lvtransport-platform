import type { Coordinate } from '../models/coordinates';
import type { TripRouteModel } from '../models/routes';

export type PlacesPrediction = { placeId: string; description: string };

export type MapProviderCapabilities = {
  placesAutocomplete: boolean;
  geocoding: boolean;
  directions: boolean;
  distanceMatrix: boolean;
  etaCompatible: boolean;
};

export type RouteRequestContext = {
  tripId?: string;
  driverId?: string;
  customerId?: string;
  routingProfile?: 'default' | 'airport-priority' | 'traffic-aware';
};

export type MapProvider = {
  name: 'google-maps';
  capabilities: MapProviderCapabilities;
  isReady(): boolean;
  initialize(): Promise<void>;
  autocomplete(input: string): Promise<PlacesPrediction[]>;
  geocode(address: string): Promise<Coordinate[]>;
  getDirections(points: Coordinate[], context?: RouteRequestContext): Promise<TripRouteModel>;
  getDistanceMatrix(origins: Coordinate[], destinations: Coordinate[]): Promise<number[][]>;
};

export class StubGoogleMapsProvider implements MapProvider {
  name: 'google-maps' = 'google-maps';
  capabilities: MapProviderCapabilities = {
    placesAutocomplete: true,
    geocoding: true,
    directions: true,
    distanceMatrix: true,
    etaCompatible: true,
  };

  private ready = false;

  isReady(): boolean {
    return this.ready;
  }

  async initialize(): Promise<void> {
    this.ready = true;
  }

  async autocomplete(): Promise<PlacesPrediction[]> { return []; }
  async geocode(): Promise<Coordinate[]> { return []; }
  async getDirections(): Promise<TripRouteModel> { throw new Error('Not implemented'); }
  async getDistanceMatrix(): Promise<number[][]> { return []; }
}

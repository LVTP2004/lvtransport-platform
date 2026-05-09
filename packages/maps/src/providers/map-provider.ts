import type { Coordinate } from '../models/coordinates';
import type { TripRouteModel } from '../models/routes';

export type PlacesPrediction = { placeId: string; description: string };

export type MapProvider = {
  name: 'google-maps';
  autocomplete(input: string): Promise<PlacesPrediction[]>;
  geocode(address: string): Promise<Coordinate[]>;
  getDirections(points: Coordinate[]): Promise<TripRouteModel>;
  getDistanceMatrix(origins: Coordinate[], destinations: Coordinate[]): Promise<number[][]>;
};

export class StubGoogleMapsProvider implements MapProvider {
  name: 'google-maps' = 'google-maps';

  async autocomplete(): Promise<PlacesPrediction[]> { return []; }
  async geocode(): Promise<Coordinate[]> { return []; }
  async getDirections(): Promise<TripRouteModel> { throw new Error('Not implemented'); }
  async getDistanceMatrix(): Promise<number[][]> { return []; }
}

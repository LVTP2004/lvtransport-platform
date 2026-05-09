export type Coordinate = {
  lat: number;
  lng: number;
  heading?: number;
  accuracyMeters?: number;
  capturedAt: string;
};

export type PickupDropoffCoordinates = {
  pickup: Coordinate;
  dropoff: Coordinate;
  waypoints?: Coordinate[];
};

export type AirportPickupCheckpoint = {
  airportCode: string;
  terminal?: string;
  coordinate: Coordinate;
};

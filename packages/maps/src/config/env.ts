export type MapEnvironment = {
  mapsProvider: 'google-maps';
  mapsApiKey?: string;
  placesApiEnabled: boolean;
  distanceMatrixEnabled: boolean;
  geocodingEnabled: boolean;
  directionsEnabled: boolean;
  trackingSocketNamespace: string;
  trackingPollingFallbackMs: number;
};

export const defaultMapEnvironment: MapEnvironment = {
  mapsProvider: 'google-maps',
  mapsApiKey: undefined,
  placesApiEnabled: true,
  distanceMatrixEnabled: true,
  geocodingEnabled: true,
  directionsEnabled: true,
  trackingSocketNamespace: '/tracking',
  trackingPollingFallbackMs: 5000,
};

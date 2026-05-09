export type ReusableMapComponentKey =
  | 'base-map-canvas'
  | 'driver-marker-layer'
  | 'customer-marker-layer'
  | 'route-polyline-layer'
  | 'airport-monitoring-layer'
  | 'trip-playback-controls'
  | 'fleet-cluster-layer';

export type ReusableMapComponentArchitecture = {
  key: ReusableMapComponentKey;
  description: string;
  usedBy: Array<'web' | 'admin' | 'driver'>;
};

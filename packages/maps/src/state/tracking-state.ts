import type { DriverLiveMarker } from '../models/tracking';
import type { TripRouteModel } from '../models/routes';

export type TrackingState = {
  activeTripId?: string;
  driverMarker?: DriverLiveMarker;
  route?: TripRouteModel;
  etaSeconds?: number;
  isPlaybackMode: boolean;
};

export const initialTrackingState: TrackingState = {
  isPlaybackMode: false,
};

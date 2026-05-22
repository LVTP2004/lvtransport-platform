export type GpsCoordinate = {
  lat: number;
  lng: number;
  heading?: number;
  speedKph?: number;
  updatedAtIso: string;
};

export type LiveDriverFeedItem = {
  driverId: string;
  vehicleCode: string;
  status: 'on-trip' | 'available' | 'break';
  coordinate: GpsCoordinate;
  activeBookingRef?: string;
};

export type LiveBookingFeedItem = {
  bookingId: string;
  referenceCode: string;
  status: string;
  pickupCoordinate?: GpsCoordinate;
  dropoffCoordinate?: GpsCoordinate;
};

export type RealtimeMapGateway = {
  subscribeDrivers: (callback: (drivers: LiveDriverFeedItem[]) => void) => () => void;
  subscribeBookings: (callback: (bookings: LiveBookingFeedItem[]) => void) => () => void;
};

export const adminMapFeatures = {
  liveFleetMap: true,
  airportPickupMonitoring: true,
  futureGeofencing: true,
  gpsReadyArchitecture: true,
  operationalVisibility: true,
};

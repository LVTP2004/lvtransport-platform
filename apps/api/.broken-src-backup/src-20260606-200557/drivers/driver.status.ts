export type DriverAvailability = 'offline' | 'online' | 'busy';

export interface DriverStatus {
  driverId: string;
  availability: DriverAvailability;
  location?: {
    lat: number;
    lng: number;
    heading?: number;
  };
  updatedAt: string;
}

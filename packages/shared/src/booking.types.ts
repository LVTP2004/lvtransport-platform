import type { RideStatus } from './ride-lifecycle';
import type { TrackingCode } from './tracking';

export type ServiceType = 'standard' | 'airport' | 'business' | 'vip';

export type CustomerTier = 'retail' | 'business';

export type CreateBookingRequest = {
  customerName: string;
  phone: string;
  email?: string;
  pickup: string;
  destination: string;
  scheduledAt: string;
  passengers: number;
  serviceType: ServiceType;
  customerTier: CustomerTier;
  notes?: string;
  luggage?: string;
  flightNumber?: string;
  terminal?: string;
  returnTrip?: boolean;
  businessVipNeeds?: string;
};

export type BookingRecord = CreateBookingRequest & {
  id: string;
  trackingCode: TrackingCode;
  status: RideStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

import type { TripCostBreakdown } from '../../pricing/models/pricing.types.js';

export type ServiceType = 'standard' | 'airport' | 'vip';

export interface CreateBookingDto {
  pickup: string;
  destination: string;
  scheduleAt: string;
  serviceType: ServiceType;
  estimatedDistanceKm?: number;
  estimatedDurationMin?: number;
  waitTimeMin?: number;
  isNight?: boolean;
}

export interface BookingRecord extends CreateBookingDto {
  id: string;
  referenceCode: string;
  status: 'pending' | 'completed';
  createdAt: string;
  fareQuote: {
    fareTotal: number;
    pricingVersion: string;
    breakdown: TripCostBreakdown;
    synchronizedAt: string;
  };
  completedFare?: {
    finalTotal: number;
    completedAt: string;
    breakdown: TripCostBreakdown;
  };
}

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'assigned'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
export type ServiceType = 'standard' | 'airport' | 'vip';

export interface CreateBookingPayload {
  pickup: string;
  destination: string;
  scheduledAt: string;
  serviceType: ServiceType;
}

export interface Booking extends CreateBookingPayload {
  id: string;
  referenceCode: string;
  status: BookingStatus;
  createdAt: string;
}

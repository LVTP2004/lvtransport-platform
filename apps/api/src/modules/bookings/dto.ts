export type ServiceType = 'standard' | 'airport' | 'vip';

export interface CreateBookingDto {
  pickup: string;
  destination: string;
  scheduleAt: string;
  serviceType: ServiceType;
}

export interface BookingRecord extends CreateBookingDto {
  id: string;
  referenceCode: string;
  status: 'pending';
  createdAt: string;
}

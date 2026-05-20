import { bookingFlowService } from './service.js';
import type { BookingRecord, CreateBookingDto } from './dto.js';

export interface MoniBookingCreatePayload {
  customerId?: string;
  pickupLocation: string;
  destination: string;
  scheduledFor: string;
  passengerCount: number;
  notes?: string;
}

export const moniBookingAdapter = {
  async createBookingFromAssistant(payload: MoniBookingCreatePayload, idempotencyKey: string): Promise<BookingRecord> {
    const dto: CreateBookingDto = {
      customerId: payload.customerId,
      pickup: payload.pickupLocation,
      destination: payload.destination,
      scheduleAt: payload.scheduledFor,
      serviceType: 'standard',
      estimatedDistanceKm: undefined,
      estimatedDurationMin: undefined,
    };

    return bookingFlowService.createBooking(dto, idempotencyKey);
  },
};

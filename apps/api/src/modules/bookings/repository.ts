import type { BookingRecord } from './dto.js';

export interface BookingRepository {
  create(record: BookingRecord): Promise<BookingRecord>;
  list(): Promise<BookingRecord[]>;
}

class InMemoryBookingRepository implements BookingRepository {
  private readonly bookings: BookingRecord[] = [];

  async create(record: BookingRecord): Promise<BookingRecord> {
    this.bookings.unshift(record);
    return record;
  }

  async list(): Promise<BookingRecord[]> {
    return [...this.bookings];
  }
}

export const bookingRepository: BookingRepository = new InMemoryBookingRepository();

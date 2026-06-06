import crypto from 'node:crypto';
export type BookingStatus = 'pending' | 'accepted' | 'rejected';

export interface Booking {
  id: string;
  customerId: string;
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number;
  fare: number;
  status: BookingStatus;
  trackingCode: string;
  assignedDriverId?: string;
  createdAt: string;
  updatedAt: string;
}

const BASE_FARE = 7;
const PER_KM = 2.25;

class BookingEngineService {
  private readonly bookings = new Map<string, Booking>();

  createBooking(input: Omit<Booking, 'id' | 'status' | 'trackingCode' | 'createdAt' | 'updatedAt' | 'fare'> & { distanceKm: number }) {
    const id = crypto.randomUUID();
    const trackingCode = `LV-${id.slice(0, 8).toUpperCase()}`;
    const now = new Date().toISOString();
    const fare = Number((BASE_FARE + input.distanceKm * PER_KM).toFixed(2));

    const booking: Booking = {
      ...input,
      id,
      fare,
      status: 'pending',
      trackingCode,
      createdAt: now,
      updatedAt: now,
    };

    this.bookings.set(id, booking);
    return booking;
  }

  listBookings() {
    return Array.from(this.bookings.values());
  }

  findByTrackingCode(code: string) {
    return this.listBookings().find((booking) => booking.trackingCode === code);
  }

  respondToRide(bookingId: string, driverId: string, action: 'accept' | 'reject') {
    const booking = this.bookings.get(bookingId);
    if (!booking) return undefined;

    booking.status = action === 'accept' ? 'accepted' : 'rejected';
    booking.assignedDriverId = driverId;
    booking.updatedAt = new Date().toISOString();
    this.bookings.set(bookingId, booking);
    return booking;
  }
}

export const bookingEngineService = new BookingEngineService();

import { createHash } from 'node:crypto';
import type { BookingRecord, CreateBookingDto } from './dto.js';

type BookingFingerprintInput = Pick<CreateBookingDto, 'customerId' | 'customerEmail' | 'customerPhone' | 'pickup' | 'destination' | 'scheduleAt' | 'serviceType'>;

export const createBookingDuplicateFingerprint = (booking: BookingFingerprintInput | BookingRecord): string | null => {
  const identity = [booking.customerId, booking.customerEmail, booking.customerPhone]
    .map((value) => value?.trim().toLowerCase())
    .find((value) => Boolean(value));
  if (!identity) return null;

  const canonical = [
    identity,
    booking.pickup.trim().toLowerCase(),
    booking.destination.trim().toLowerCase(),
    booking.scheduleAt,
    booking.serviceType,
  ].join('\\0');
  return createHash('sha256').update(canonical).digest('hex');
};

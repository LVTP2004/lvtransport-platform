import { createHash } from 'node:crypto';
import type { BookingRecord, CreateBookingDto } from './dto.js';

type BookingFingerprintInput = Pick<CreateBookingDto, 'customerId' | 'customerIdentityVerified' | 'customerEmail' | 'customerPhone' | 'pickup' | 'destination' | 'scheduleAt' | 'serviceType'>;

export const createBookingDuplicateFingerprint = (booking: BookingFingerprintInput | BookingRecord): string | null => {
  const identity = [booking.customerId, booking.customerEmail, booking.customerPhone]
    .map((value) => value?.trim().toLowerCase())
    .find((value) => Boolean(value));
  if (!identity) return null;

  const canonical = [
    booking.customerIdentityVerified === true ? 'verified-customer' : 'public-contact',
    identity,
    booking.pickup.trim().toLowerCase(),
    booking.destination.trim().toLowerCase(),
    booking.scheduleAt,
    booking.serviceType,
  ].join('\u0000');
  return createHash('sha256').update(canonical).digest('hex');
};

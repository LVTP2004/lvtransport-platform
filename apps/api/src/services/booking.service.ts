import crypto from 'node:crypto';
import { bookingRepository } from '../storage/booking.repository.js';
import type { Booking, CreateBookingPayload } from '../types/booking.types.js';

const allowedServiceTypes = ['standard', 'airport', 'vip'] as const;

const generateBookingReference = () => {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LV-${new Date().getFullYear()}-${randomPart}`;
};

const validatePayload = (payload: Partial<CreateBookingPayload>) => {
  const errors: string[] = [];

  if (!payload.pickup?.trim()) errors.push('pickup is required');
  if (!payload.destination?.trim()) errors.push('destination is required');
  if (!payload.scheduledAt?.trim()) errors.push('scheduledAt is required');

  if (!payload.serviceType || !allowedServiceTypes.includes(payload.serviceType)) {
    errors.push('serviceType must be one of: standard, airport, vip');
  }

  if (payload.scheduledAt && Number.isNaN(Date.parse(payload.scheduledAt))) {
    errors.push('scheduledAt must be a valid ISO date/time string');
  }

  return errors;
};

export const bookingService = {
  createBooking(payload: Partial<CreateBookingPayload>) {
    const errors = validatePayload(payload);
    if (errors.length > 0) {
      return { success: false as const, message: 'Invalid booking payload', errors };
    }

    const booking: Booking = {
      id: crypto.randomUUID(),
      referenceCode: generateBookingReference(),
      pickup: payload.pickup!.trim(),
      destination: payload.destination!.trim(),
      scheduledAt: payload.scheduledAt!,
      serviceType: payload.serviceType!,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // TODO: Replace in-memory repository with Firestore booking collection persistence.
    bookingRepository.create(booking);

    return { success: true as const, booking };
  },

  listBookings() {
    return bookingRepository.list();
  },
};

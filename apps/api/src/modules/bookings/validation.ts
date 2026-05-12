import type { CreateBookingDto, ServiceType } from './dto.js';

const SERVICE_TYPES: ServiceType[] = ['standard', 'airport', 'vip'];

export const validateCreateBookingPayload = (payload: unknown): CreateBookingDto => {
  if (!payload || typeof payload !== 'object') throw new Error('Payload is required');
  const candidate = payload as Partial<CreateBookingDto> & { scheduledAt?: string };
  const scheduleAt = candidate.scheduleAt ?? candidate.scheduledAt;

  if (!candidate.pickup?.trim()) throw new Error('pickup is required');
  if (!candidate.destination?.trim()) throw new Error('destination is required');
  if (!scheduleAt) throw new Error('scheduledAt is required');
  if (Number.isNaN(new Date(scheduleAt).getTime())) throw new Error('scheduledAt must be a valid datetime');
  if (!candidate.serviceType || !SERVICE_TYPES.includes(candidate.serviceType)) throw new Error('serviceType must be standard|airport|vip');

  return {
    pickup: candidate.pickup.trim(),
    destination: candidate.destination.trim(),
    scheduleAt,
    serviceType: candidate.serviceType,
  };
};

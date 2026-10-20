import type { CreateBookingDto, ServiceType } from './dto.js';

const SERVICE_TYPES: ServiceType[] = ['standard', 'airport', 'vip'];

const optionalText = (value: unknown, field: string, maxLength: number): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') throw new Error(`${field} must be a string`);
  const normalized = value.trim();
  if (!normalized) return undefined;
  if (normalized.length > maxLength) throw new Error(`${field} must be at most ${maxLength} characters`);
  return normalized;
};

export const validateCreateBookingPayload = (payload: unknown): CreateBookingDto => {
  if (!payload || typeof payload !== 'object') throw new Error('Payload is required');
  const candidate = payload as Partial<CreateBookingDto> & { scheduledAt?: string };
  const scheduleAt = candidate.scheduleAt ?? candidate.scheduledAt;

  if (!candidate.pickup?.trim()) throw new Error('pickup is required');
  if (!candidate.destination?.trim()) throw new Error('destination is required');
  if (!scheduleAt) throw new Error('scheduledAt is required');
  if (Number.isNaN(new Date(scheduleAt).getTime())) throw new Error('scheduledAt must be a valid datetime');
  if (!candidate.serviceType || !SERVICE_TYPES.includes(candidate.serviceType)) throw new Error('serviceType must be standard|airport|vip');

  const customerId = optionalText(candidate.customerId, 'customerId', 120);
  const customerName = optionalText(candidate.customerName, 'customerName', 120);
  const customerPhone = optionalText(candidate.customerPhone, 'customerPhone', 40);
  const customerEmail = optionalText(candidate.customerEmail, 'customerEmail', 254);
  const notes = optionalText(candidate.notes, 'notes', 2000);

  if (customerEmail && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(customerEmail)) throw new Error('customerEmail must be a valid email address');
  if (customerPhone && (!/^[+\\d() .-]+$/.test(customerPhone) || customerPhone.replace(/\\D/g, '').length < 6 || customerPhone.replace(/\\D/g, '').length > 20)) {
    throw new Error('customerPhone must be a valid phone number');
  }

  return {
    customerId,
    customerName,
    customerPhone,
    customerEmail,
    notes,
    pickup: candidate.pickup.trim(),
    destination: candidate.destination.trim(),
    scheduleAt,
    serviceType: candidate.serviceType,
    airportIntel: candidate.airportIntel && typeof candidate.airportIntel === 'object'
      ? {
          flightNumber: typeof candidate.airportIntel.flightNumber === 'string' ? candidate.airportIntel.flightNumber.trim() : undefined,
          airline: typeof candidate.airportIntel.airline === 'string' ? candidate.airportIntel.airline.trim() : undefined,
          terminal: typeof candidate.airportIntel.terminal === 'string' ? candidate.airportIntel.terminal.trim() : undefined,
          arrivalAirport: typeof candidate.airportIntel.arrivalAirport === 'string' ? candidate.airportIntel.arrivalAirport.trim() : undefined,
        }
      : undefined,
  };
};

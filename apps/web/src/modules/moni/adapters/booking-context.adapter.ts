import type { MoniBookingFields, MoniContextEnvelope } from '../types/moni.types';

export const requiredBookingFields: Array<keyof MoniBookingFields> = [
  'pickup',
  'destination',
  'date',
  'time',
  'passengers',
  'contactDetails'
];

export const getMissingBookingFields = (context: MoniContextEnvelope): Array<keyof MoniBookingFields> => {
  const known = context.booking?.knownFields ?? {};
  return requiredBookingFields.filter((field) => !known[field]);
};

export const explainBookingStatus = (status?: string): string => {
  const normalized = (status ?? 'unknown').toLowerCase();
  const map: Record<string, string> = {
    pending: 'Your booking is pending review by dispatch.',
    accepted: 'Your booking has been accepted by operations.',
    assigned: 'A driver has been assigned to your ride.',
    onderweg: 'The assigned driver is on the way.',
    arrived: 'Your driver has arrived at the pickup location.',
    in_progress: 'Your ride is currently in progress.',
    completed: 'Your ride has been completed.',
    cancelled: 'This booking has been cancelled.'
  };
  return map[normalized] ?? 'Booking status is currently unverified. Please share your booking code for confirmation.';
};

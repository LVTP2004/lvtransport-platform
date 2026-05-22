export const BOOKING_LIFECYCLE = [
  'pending',
  'quoted',
  'confirmed',
  'assigned',
  'driver_arriving',
  'passenger_onboard',
  'completed',
  'cancelled',
  'failed',
] as const;

export type BookingLifecycleStatus = (typeof BOOKING_LIFECYCLE)[number];

export type BookingTimelineEntry = {
  status: BookingLifecycleStatus;
  at: string;
  actor: 'customer' | 'admin' | 'driver' | 'system';
};

export type BookingRecord = {
  id: string;
  bookingCode: string;
  customerId: string;
  driverId?: string;
  pickup: string;
  destination: string;
  status: BookingLifecycleStatus;
  timeline: BookingTimelineEntry[];
  version: number;
  createdAt: string;
  updatedAt: string;
};

export const BOOKING_STATUS_TRANSITIONS: Record<BookingLifecycleStatus, BookingLifecycleStatus[]> = {
  pending: ['quoted', 'cancelled', 'failed'],
  quoted: ['confirmed', 'cancelled', 'failed'],
  confirmed: ['assigned', 'cancelled', 'failed'],
  assigned: ['driver_arriving', 'cancelled', 'failed'],
  driver_arriving: ['passenger_onboard', 'cancelled', 'failed'],
  passenger_onboard: ['completed', 'cancelled', 'failed'],
  completed: [],
  cancelled: [],
  failed: [],
};

export const canTransitionBookingStatus = (from: BookingLifecycleStatus, to: BookingLifecycleStatus): boolean =>
  BOOKING_STATUS_TRANSITIONS[from].includes(to);

export const makeTimelineEntry = (status: BookingLifecycleStatus, actor: BookingTimelineEntry['actor'], at = new Date().toISOString()): BookingTimelineEntry => ({ status, actor, at });

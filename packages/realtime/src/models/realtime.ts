import type { BookingLifecycle } from './enums';

export type BookingActor = 'customer' | 'admin' | 'driver' | 'system';

export type BookingTimelineEntry = {
  status: BookingLifecycle;
  actor: BookingActor;
  at: string;
  note?: string;
};

export type BookingRecord = {
  id: string;
  code: string;
  customerName: string;
  pickup: string;
  destination: string;
  status: BookingLifecycle;
  assignedDriverId?: string;
  assignedDriverName?: string;
  version: number;
  timeline: BookingTimelineEntry[];
  createdAt: string;
  updatedAt: string;
};

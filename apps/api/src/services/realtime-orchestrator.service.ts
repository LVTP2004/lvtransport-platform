import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { WebSocket } from 'ws';

export const BOOKING_LIFECYCLE = [
  'pending',
  'quoted',
  'confirmed',
  'assigned',
  'driver_arriving',
  'passenger_onboard',
  'completed',
  'cancelled',
  'failed'
] as const;

export type BookingLifecycleStatus = (typeof BOOKING_LIFECYCLE)[number];

export type BookingActor = 'customer' | 'admin' | 'driver' | 'system';

export type BookingTimelineEntry = {
  status: BookingLifecycleStatus;
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
  status: BookingLifecycleStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  version: number;
  timeline: BookingTimelineEntry[];
  createdAt: string;
  updatedAt: string;
};

const allowedTransitions: Record<BookingLifecycleStatus, BookingLifecycleStatus[]> = {
  pending: ['quoted', 'cancelled', 'failed'],
  quoted: ['confirmed', 'cancelled', 'failed'],
  confirmed: ['assigned', 'cancelled', 'failed'],
  assigned: ['driver_arriving', 'cancelled', 'failed'],
  driver_arriving: ['passenger_onboard', 'cancelled', 'failed'],
  passenger_onboard: ['completed', 'cancelled', 'failed'],
  completed: [],
  cancelled: [],
  failed: []
};

const bookingEvents = new EventEmitter();
const bookings = new Map<string, BookingRecord>();
const idempotencyKeys = new Set<string>();
const websocketClients = new Set<WebSocket>();

const emit = (event: string, payload: unknown) => {
  const envelope = JSON.stringify({ event, payload, at: new Date().toISOString() });
  for (const client of websocketClients) {
    if (client.readyState === client.OPEN) {
      client.send(envelope);
    }
  }
  bookingEvents.emit(event, payload);
};

const createBookingCode = () => `LV-${Math.floor(100000 + Math.random() * 900000)}`;

export const realtimeOrchestratorService = {
  initialize(): void {},

  registerClient(socket: WebSocket): void {
    websocketClients.add(socket);
    socket.on('close', () => websocketClients.delete(socket));
    socket.send(JSON.stringify({ event: 'booking.snapshot', payload: Array.from(bookings.values()) }));
  },

  on(event: string, handler: (payload: unknown) => void): void {
    bookingEvents.on(event, handler);
  },

  createBooking(input: { customerName: string; pickup: string; destination: string }): BookingRecord {
    const now = new Date().toISOString();
    const booking: BookingRecord = {
      id: randomUUID(),
      code: createBookingCode(),
      customerName: input.customerName,
      pickup: input.pickup,
      destination: input.destination,
      status: 'pending',
      version: 1,
      timeline: [{ status: 'pending', actor: 'customer', at: now, note: 'Booking created' }],
      createdAt: now,
      updatedAt: now
    };
    bookings.set(booking.id, booking);
    emit('booking.created', booking);
    return booking;
  },

  listBookings(): BookingRecord[] {
    return Array.from(bookings.values());
  },

  assignDriver(params: { bookingId: string; driverId: string; driverName: string; idempotencyKey?: string }): BookingRecord {
    const booking = bookings.get(params.bookingId);
    if (!booking) throw new Error('BOOKING_NOT_FOUND');
    if (params.idempotencyKey && idempotencyKeys.has(params.idempotencyKey)) return booking;
    if (booking.status !== 'confirmed' && booking.status !== 'assigned') throw new Error('INVALID_TRANSITION');

    booking.assignedDriverId = params.driverId;
    booking.assignedDriverName = params.driverName;
    booking.status = 'assigned';
    booking.version += 1;
    booking.updatedAt = new Date().toISOString();
    booking.timeline.push({ status: 'assigned', actor: 'admin', at: booking.updatedAt, note: `Driver ${params.driverName} assigned` });
    if (params.idempotencyKey) idempotencyKeys.add(params.idempotencyKey);
    emit('booking.updated', booking);
    emit('driver.assigned', booking);
    return booking;
  },

  transitionStatus(params: { bookingId: string; nextStatus: BookingLifecycleStatus; actor: BookingActor; idempotencyKey?: string; expectedVersion?: number }): BookingRecord {
    const booking = bookings.get(params.bookingId);
    if (!booking) throw new Error('BOOKING_NOT_FOUND');
    if (params.idempotencyKey && idempotencyKeys.has(params.idempotencyKey)) return booking;
    if (typeof params.expectedVersion === 'number' && params.expectedVersion !== booking.version) throw new Error('VERSION_CONFLICT');
    const nextAllowed = allowedTransitions[booking.status];
    if (!nextAllowed.includes(params.nextStatus)) throw new Error('INVALID_TRANSITION');

    booking.status = params.nextStatus;
    booking.version += 1;
    booking.updatedAt = new Date().toISOString();
    booking.timeline.push({ status: params.nextStatus, actor: params.actor, at: booking.updatedAt });
    if (params.idempotencyKey) idempotencyKeys.add(params.idempotencyKey);
    emit('booking.updated', booking);
    emit('booking.lifecycle.changed', booking);
    return booking;
  }
};

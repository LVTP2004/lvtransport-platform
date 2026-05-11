import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { WebSocket } from 'ws';

export const BOOKING_LIFECYCLE = [
  'pending',
  'quoted',
  'confirmed',
  'available',
  'assigned',
  'onderweg',
  'arrived',
  'in_progress',
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
  tracking: {
    etaMinutes: number | null;
    lastKnownLocation: { lat: number; lng: number; heading?: number } | null;
    routePolyline: string | null;
    gpsProvider: 'none' | 'future';
    updatedAt: string;
  };
};

export const DRIVER_STATES = ['available', 'assigned', 'onderweg', 'arrived', 'in_progress', 'completed'] as const;
export type DriverState = (typeof DRIVER_STATES)[number];

export type DriverRealtimeState = {
  driverId: string;
  state: DriverState;
  activeBookingId?: string;
  lastUpdatedAt: string;
};

const allowedTransitions: Record<BookingLifecycleStatus, BookingLifecycleStatus[]> = {
  pending: ['quoted', 'cancelled', 'failed'],
  quoted: ['confirmed', 'available', 'cancelled', 'failed'],
  confirmed: ['available', 'assigned', 'cancelled', 'failed'],
  available: ['assigned', 'cancelled', 'failed'],
  assigned: ['onderweg', 'cancelled', 'failed'],
  onderweg: ['arrived', 'cancelled', 'failed'],
  arrived: ['in_progress', 'cancelled', 'failed'],
  in_progress: ['completed', 'cancelled', 'failed'],
  completed: [],
  cancelled: [],
  failed: []
};

const bookingEvents = new EventEmitter();
const bookings = new Map<string, BookingRecord>();
const idempotencyKeys = new Set<string>();
const websocketClients = new Set<WebSocket>();
const driverStates = new Map<string, DriverRealtimeState>();

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
    socket.send(JSON.stringify({ event: 'driver.snapshot', payload: Array.from(driverStates.values()) }));
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
      updatedAt: now,
      tracking: {
        etaMinutes: null,
        lastKnownLocation: null,
        routePolyline: null,
        gpsProvider: 'future',
        updatedAt: now
      }
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
    if (!['confirmed', 'available', 'assigned'].includes(booking.status)) throw new Error('INVALID_TRANSITION');

    booking.assignedDriverId = params.driverId;
    booking.assignedDriverName = params.driverName;
    booking.status = 'assigned';
    booking.version += 1;
    booking.updatedAt = new Date().toISOString();
    booking.timeline.push({ status: 'assigned', actor: 'admin', at: booking.updatedAt, note: `Driver ${params.driverName} assigned` });
    driverStates.set(params.driverId, {
      driverId: params.driverId,
      state: 'assigned',
      activeBookingId: booking.id,
      lastUpdatedAt: booking.updatedAt
    });
    if (params.idempotencyKey) idempotencyKeys.add(params.idempotencyKey);
    emit('booking.updated', booking);
    emit('driver.assigned', booking);
    emit('driver.status.updated', driverStates.get(params.driverId));
    emit('admin.live.updated', { bookingId: booking.id, driverId: params.driverId, status: booking.status, at: booking.updatedAt });
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
    if (booking.assignedDriverId) {
      const mappedDriverState = (['assigned', 'onderweg', 'arrived', 'in_progress', 'completed'].includes(params.nextStatus)
        ? params.nextStatus
        : params.nextStatus === 'available'
          ? 'available'
          : null) as DriverState | null;
      if (mappedDriverState) {
        driverStates.set(booking.assignedDriverId, {
          driverId: booking.assignedDriverId,
          state: mappedDriverState,
          activeBookingId: mappedDriverState === 'completed' ? undefined : booking.id,
          lastUpdatedAt: booking.updatedAt
        });
        emit('driver.status.updated', driverStates.get(booking.assignedDriverId));
      }
    }
    if (params.idempotencyKey) idempotencyKeys.add(params.idempotencyKey);
    emit('booking.updated', booking);
    emit('booking.lifecycle.changed', booking);
    emit('admin.live.updated', { bookingId: booking.id, status: booking.status, at: booking.updatedAt });
    return booking;
  },

  updateDriverState(params: { driverId: string; state: DriverState; bookingId?: string; idempotencyKey?: string }): DriverRealtimeState {
    if (params.idempotencyKey && idempotencyKeys.has(params.idempotencyKey)) {
      return driverStates.get(params.driverId) ?? { driverId: params.driverId, state: params.state, lastUpdatedAt: new Date().toISOString() };
    }
    const now = new Date().toISOString();
    const nextState: DriverRealtimeState = {
      driverId: params.driverId,
      state: params.state,
      activeBookingId: params.bookingId,
      lastUpdatedAt: now
    };
    driverStates.set(params.driverId, nextState);
    if (params.idempotencyKey) idempotencyKeys.add(params.idempotencyKey);
    emit('driver.status.updated', nextState);
    emit('admin.live.updated', { driverId: params.driverId, state: params.state, bookingId: params.bookingId, at: now });
    return nextState;
  },

  listDriverStates(): DriverRealtimeState[] {
    return Array.from(driverStates.values());
  }
};

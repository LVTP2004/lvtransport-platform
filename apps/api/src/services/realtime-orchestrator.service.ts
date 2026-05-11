import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { WebSocket } from 'ws';

export const BOOKING_LIFECYCLE = [
  'pending',
  'accepted',
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
  pending: ['accepted', 'quoted', 'cancelled', 'failed'],
  accepted: ['quoted', 'confirmed', 'available', 'assigned', 'cancelled', 'failed'],
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
const eventReplayBuffer: string[] = [];
const MAX_REPLAY_EVENTS = 250;
let eventSequence = 0;
let heartbeatInterval: NodeJS.Timeout | undefined;

type RealtimeSocket = WebSocket & { isAlive?: boolean };

const emit = (event: string, payload: unknown) => {
  const envelopeObject = {
    event,
    payload,
    at: new Date().toISOString(),
    sequence: ++eventSequence
  };
  const envelope = JSON.stringify(envelopeObject);
  eventReplayBuffer.push(envelope);
  if (eventReplayBuffer.length > MAX_REPLAY_EVENTS) {
    eventReplayBuffer.splice(0, eventReplayBuffer.length - MAX_REPLAY_EVENTS);
  }
  for (const client of websocketClients) {
    if (client.readyState === client.OPEN) {
      client.send(envelope);
    }
  }
  bookingEvents.emit(event, payload);
};

const parseLastSequenceFromUrl = (url?: string): number | null => {
  if (!url) return null;
  const queryIndex = url.indexOf('?');
  if (queryIndex < 0) return null;
  const query = url.slice(queryIndex + 1);
  const parsed = new URLSearchParams(query).get('lastSequence');
  if (!parsed) return null;
  const asNumber = Number(parsed);
  return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : null;
};

const createBookingCode = () => `LV-${Math.floor(100000 + Math.random() * 900000)}`;

export const realtimeOrchestratorService = {
  initialize(): void {
    if (heartbeatInterval) return;
    heartbeatInterval = setInterval(() => {
      for (const socket of websocketClients) {
        const client = socket as RealtimeSocket;
        if (client.isAlive === false) {
          socket.terminate();
          websocketClients.delete(socket);
          continue;
        }
        client.isAlive = false;
        socket.ping();
      }
    }, 30000);
  },

  registerClient(socket: WebSocket): void {
    const client = socket as RealtimeSocket;
    client.isAlive = true;
    websocketClients.add(socket);
    socket.on('pong', () => {
      client.isAlive = true;
    });
    socket.on('close', () => websocketClients.delete(socket));
    const lastSequence = parseLastSequenceFromUrl((socket as unknown as { url?: string }).url);
    if (lastSequence) {
      for (const replayEvent of eventReplayBuffer) {
        const parsed = JSON.parse(replayEvent) as { sequence?: number };
        if ((parsed.sequence ?? 0) > lastSequence) {
          socket.send(replayEvent);
        }
      }
    }
    socket.send(JSON.stringify({ event: 'booking.snapshot', payload: Array.from(bookings.values()), sequence: eventSequence }));
    socket.send(JSON.stringify({ event: 'driver.snapshot', payload: Array.from(driverStates.values()), sequence: eventSequence }));
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
    if (booking.status === params.nextStatus) return booking;
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
    const existingState = driverStates.get(params.driverId);
    if (existingState && existingState.state === params.state && existingState.activeBookingId === params.bookingId) {
      return existingState;
    }
    const nextState: DriverRealtimeState = {
      driverId: params.driverId,
      state: params.state,
      activeBookingId: params.bookingId,
      lastUpdatedAt: now
    };
    driverStates.set(params.driverId, nextState);
    if (params.bookingId) {
      const booking = bookings.get(params.bookingId);
      if (booking && booking.assignedDriverId === params.driverId) {
        const mappedStatus = (params.state === 'available' ? 'available' : params.state) as BookingLifecycleStatus;
        if (booking.status !== mappedStatus && allowedTransitions[booking.status].includes(mappedStatus)) {
          booking.status = mappedStatus;
          booking.version += 1;
          booking.updatedAt = now;
          booking.timeline.push({ status: mappedStatus, actor: 'driver', at: now, note: 'Synced from driver state' });
          emit('booking.updated', booking);
          emit('booking.lifecycle.changed', booking);
        }
      }
    }
    if (params.idempotencyKey) idempotencyKeys.add(params.idempotencyKey);
    emit('driver.status.updated', nextState);
    emit('admin.live.updated', { driverId: params.driverId, state: params.state, bookingId: params.bookingId, at: now });
    return nextState;
  },

  listDriverStates(): DriverRealtimeState[] {
    return Array.from(driverStates.values());
  }
};
